The Project ODIN-(Optical Device Intellegent Navigation)
# Odin: AI-Powered Visual Assistant

**Odin** is an AI-driven visual assistant designed to provide assistance to visually impaired individuals. The system integrates image captioning, obstacle detection, depth estimation, and conversational capabilities to create a powerful, multi-functional tool.

---

## Features

- **Image Captioning**: Describe the content of an image using AI-powered visual language models.
- **Obstacle Detection**: Identify obstacles and provide navigation guidance.
- **Depth Prediction**: Generate depth maps and estimate the focal length of an image.
- **Conversational Chatbot**: Friendly and interactive chatbot for general conversation or assisting with tasks.
- **Voice Feedback**: Provides auditory feedback for responses and warnings.

---

## Project Structure

```plaintext
Odin-Visual-Assistant/
│
├── main.py                # Main entry point for the application
├── depth_model.py         # Module for depth and focal length prediction
├── image_analysis.py      # Module for image captioning and processing
├── chatbot.py             # Chatbot logic and interaction
├── requirements.txt       # Required Python libraries
├── README.md              # Project documentation
└── checkpoints/           # Folder to store model weights
    └── depth_pro.pt       # Pre-trained weights for the depth model
```

---

## Prerequisites

- **Python 3.8+**
- GPU recommended for faster inference, but the code works on CPU.

---

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Pramoda-S-R/odin-codered25.git
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Download model weights**:

   - Place the pre-trained `depth_pro.pt` file into the `checkpoints/` directory.
   - Add the `moondream` model file (e.g., `moondream-0_5b-int8.mf`) in an accessible directory and update its path in the code.

4. **Configure API keys**:

   - Replace `your_api_key` in `chatbot.py` with your Groq API key.

---

## Usage

1. **Run the main program**:

   ```bash
   python main.py
   ```

2. **Modes**:
   - **Image Analysis Mode**: Processes images to generate captions, detect obstacles, and predict depth.
   - **General Chatbot Mode**: Interactive conversation with the chatbot. Use the command `SEE` to switch back to Image Analysis Mode.

3. **Controls**:
   - In Image Analysis Mode:
     - Type `SAVE` to save the processed image.
     - Type `hold` to switch to General Chatbot Mode.
   - In General Chatbot Mode:
     - Type `SEE` to switch to Image Analysis Mode.
     - Type `exit` to end the session.

---

## Key Functionality

### Image Captioning
- Automatically generates a description of the input image.

### Depth Prediction
- Produces a depth map and estimates the focal length for a given image.

### Obstacle Detection
- Identifies obstacles and suggests safe navigation directions.

### Conversational AI
- Provides a friendly chatbot interface for various tasks.

---


---

## Contributing

Contributions are welcome! If you'd like to add features or fix bugs:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a detailed explanation.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Acknowledgements

- **Moondream** for the image-captioning model.
- **PyTorch** for enabling seamless deep learning development.
- **Groq** for the chatbot API.
