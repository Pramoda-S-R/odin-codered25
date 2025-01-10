from groq import Groq

client = Groq(api_key="your_api_key")

def general_chatbot_mode():
    print("General Chatbot Mode Activated.")
    print("Type 'SEE' to switch to Image Analysis Mode or 'exit' to terminate the session.")

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() == 'exit':
            print("Chatbot: Goodbye!")
            break
        elif user_input.lower() == 'see':
            print("Switching to Image Analysis Mode.")
            break
        else:
            reply = general_chatbot_response(user_input)
            print(f"Chatbot: {reply}")

def general_chatbot_response(user_input):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": user_input}],
        temperature=0.7
    )
    return response.choices[0].message.content.strip()
