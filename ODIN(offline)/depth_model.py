import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image

class DepthProModel(nn.Module):
    def __init__(self):
        super(DepthProModel, self).__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.ReLU()
        )
        self.decoder_depth = nn.Sequential(
            nn.Conv2d(128, 64, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 1, kernel_size=3, stride=1, padding=1)
        )
        self.decoder_focallength = nn.Sequential(
            nn.Linear(128 * 256 * 256, 1)
        )

    def forward(self, x):
        features = self.encoder(x)
        depth = self.decoder_depth(features)
        features_flat = features.view(features.size(0), -1)
        focal_length = self.decoder_focallength(features_flat)
        return {"depth": depth, "focallength_px": focal_length}

def run_depth_inference(image_path):
    model_path = "checkpoints/depth_pro.pt"
    model = DepthProModel()
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')), strict=False)
    model.eval()

    transform = transforms.Compose([transforms.Resize((256, 256)), transforms.ToTensor()])
    image = Image.open(image_path).convert("RGB")
    image_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        prediction = model(image_tensor)
        depth = prediction["depth"].squeeze().numpy()
        focal_length = prediction["focallength_px"].item()

    return depth, focal_length
