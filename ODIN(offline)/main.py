import time
import os
import shutil
from PIL import Image
import pyttsx3
from chatbot import general_chatbot_mode, general_chatbot_response, image_analysis_response
from image_analysis import process_image
from depth_model import DepthProModel, run_depth_inference
import torch
import torchvision.transforms as transforms
import matplotlib.pyplot as plt

# Global variables
chatbot_mode = "image_analysis"
conversation_history = []
last_caption = None

# Initialize Text-to-Speech engine
tts_engine = pyttsx3.init()

def voice_output(message):
    """Generate voice output for a given message."""
    tts_engine.say(message)
    tts_engine.runAndWait()

def image_analysis_mode(image_path):
    global chatbot_mode, last_caption

    print("Switching to Image Analysis Mode.")

    while True:
        # Process the image and generate a caption
        caption = process_image(image_path)
        if caption:
            last_caption = caption
            print(f"You: {caption}")

            reply = image_analysis_response(caption)
            print(f"Chatbot: {reply}\n")
        else:
            print("[Error] Unable to process the image. Exiting Image Analysis Mode.")
            return

        # Run depth prediction
        depth, focal_length = run_depth_inference(image_path)
        print(f"[Depth Prediction] Focal Length: {focal_length}px")

        # Display the results
        show_depth_map(image_path, depth, focal_length)

        # Prompt the user for the next action
        print("\nType 'SAVE' to save the image, 'hold' to switch to General Chatbot Mode, or press Enter to continue in Image Analysis Mode.")
        user_command = input("Command: ").strip().lower()

        if user_command == "save":
            save_image(image_path)
        elif user_command == "hold":
            print("Switching to General Chatbot Mode.\n")
            voice_output("Switching to General Chatbot Mode.")
            chatbot_mode = "general_chatbot"
            general_chatbot_mode()
        else:
            print("Continuing in Image Analysis Mode.\n")

def save_image(image_path):
    """Save the current image to a predefined directory."""
    try:
        save_directory = "SAVES_MARK_04"
        os.makedirs(save_directory, exist_ok=True)
        save_path = os.path.join(save_directory, "temporary_image.jpg")
        shutil.copy(image_path, save_path)
        print(f"[System] Image saved successfully to {save_path}.")
        voice_output("Image has been saved successfully.")
    except Exception as e:
        print(f"[Error] Failed to save the image: {e}")
        voice_output("Failed to save the image.")

def show_depth_map(image_path, depth, focal_length):
    """Display the input image and corresponding depth map."""
    image = Image.open(image_path).convert("RGB")

    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.imshow(image)
    plt.title("Input Image")
    plt.axis("off")

    plt.subplot(1, 2, 2)
    plt.imshow(depth, cmap="viridis")
    plt.title(f"Depth Map\nFocal Length: {focal_length:.2f}px")
    plt.axis("off")

    plt.show()

def main():
    welcome_message = "Welcome to Odin, your AI-powered visual assistant."
    print(f"Chatbot: {welcome_message}")
    voice_output(welcome_message)
    image_analysis_mode("path/to/image.jpg")  # Replace with the actual image path

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nChatbot: Session terminated by user.")
        voice_output("Goodbye!")
