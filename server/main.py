import asyncio
import json
import os
import websockets
from google import genai
import base64

# Load API key from environment
os.environ['GOOGLE_API_KEY'] = 'AIzaSyAqZt7ULUlJXHzIW-bsRHPcP9XCwyPx5cM'
MODEL = "gemini-2.0-flash-exp"

client = genai.Client(http_options={'api_version': 'v1alpha'})

# Mock function to set light values
def set_light_values(brightness, color_temp):
    print(f"Setting light values: brightness={brightness}, color_temp={color_temp}")
    return {"brightness": brightness, "colorTemperature": color_temp}

# Tool definition for handling light settings
tool_set_light_values = {
    "function_declarations": [
        {
            "name": "set_light_values",
            "description": "Set the brightness and color temperature of a room light.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "brightness": {"type": "NUMBER", "description": "Light level from 0 to 100."},
                    "color_temp": {"type": "STRING", "description": "Color temperature: `daylight`, `cool`, or `warm`."}
                },
                "required": ["brightness", "color_temp"]
            }
        }
    ]
}

async def gemini_session_handler(client_websocket: websockets.WebSocketServerProtocol):
    """Handles interaction with Gemini API over a websocket session."""
    try:
        print("Client connected.")
        config_message = await client_websocket.recv()
        print(f"Received config message: {config_message}")
        config_data = json.loads(config_message)
        config = config_data.get("setup", {})
        config["tools"] = [tool_set_light_values]

        async with client.aio.live.connect(model=MODEL, config=config) as session:
            print("Connected to Gemini live session.")

            async def send_to_gemini():
                try:
                    async for message in client_websocket:
                        print(f"Message from client: {message}")
                        data = json.loads(message)
                        if "realtime_input" in data:
                            for chunk in data["realtime_input"]["media_chunks"]:
                                print(f"Sending chunk to Gemini: {chunk['mime_type']}")
                                if chunk["mime_type"] in ["audio/pcm", "image/jpeg"]:
                                    await session.send({"mime_type": chunk["mime_type"], "data": chunk["data"]})
                except Exception as e:
                    print(f"Error sending to Gemini: {e}")

            async def receive_from_gemini():
                try:
                    while True:
                        async for response in session.receive():
                            print(f"Received response from Gemini: {response}")
                            if response.server_content is None and response.tool_call:
                                function_calls = response.tool_call.function_calls
                                function_responses = []

                                for function_call in function_calls:
                                    print(f"Processing tool call: {function_call}")
                                    if function_call.name == "set_light_values":
                                        try:
                                            result = set_light_values(
                                                int(function_call.args["brightness"]),
                                                function_call.args["color_temp"]
                                            )
                                            function_responses.append({
                                                "name": function_call.name,
                                                "response": {"result": result},
                                                "id": function_call.id
                                            })
                                        except Exception as e:
                                            print(f"Error executing function: {e}")

                                await session.send(function_responses)
                                print(f"Sent function responses: {function_responses}")

                            if response.server_content and response.server_content.model_turn:
                                for part in response.server_content.model_turn.parts:
                                    if part.text:
                                        print(f"Text response from Gemini: {part.text}")
                                        await client_websocket.send(json.dumps({"text": part.text}))
                                    elif part.inline_data:
                                        base64_audio = base64.b64encode(part.inline_data.data).decode('utf-8')
                                        print("Sending audio response to client.")
                                        await client_websocket.send(json.dumps({"audio": base64_audio}))

                            if response.server_content and response.server_content.turn_complete:
                                print("Turn complete.")
                                break
                except Exception as e:
                    print(f"Error receiving from Gemini: {e}")

            send_task = asyncio.create_task(send_to_gemini())
            receive_task = asyncio.create_task(receive_from_gemini())
            await asyncio.gather(send_task, receive_task)

    except Exception as e:
        print(f"Error in Gemini session: {e}")

async def main() -> None:
    try:
        async with websockets.serve(gemini_session_handler, "localhost", 9082):
            print("Running websocket server on localhost:9082...")
            await asyncio.Future()  # Run indefinitely
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    asyncio.run(main())
