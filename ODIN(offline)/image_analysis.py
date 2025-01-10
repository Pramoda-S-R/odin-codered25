from PIL import Image
import moondream as md

def process_image(image_path):
    try:
        model = md.vl(model="path/to/moondream-model.mf")
        image = Image.open(image_path).resize((224, 224))
        encoded_image = model.encode_image(image)
        caption = model.caption(encoded_image)["caption"]
        return caption
    except Exception as e:
        print(f"Error processing image: {e}")
        return None
