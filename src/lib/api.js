import axios from 'axios';

const API_BASE = "http://127.0.0.1:5000";

export const uploadFrame = (frame) => {
  const formData = new FormData();
  formData.append('frame', frame);
  return axios.post(`${API_BASE}/upload/frame`, formData);
};

export const uploadAudio = (audio) => {
  const formData = new FormData();
  formData.append('audio', audio);
  return axios.post(`${API_BASE}/upload/audio`, formData);
};

export const processInput = (videoPath, audioPath) => {
  return axios.post(`${API_BASE}/process`, { video_path: videoPath, audio_path: audioPath });
};
