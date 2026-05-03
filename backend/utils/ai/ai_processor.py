import openai
import os

class AIProcessor:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def transcribe(self, file_path: str):
        # Transcrição usando Whisper
        with open(file_path, "rb") as audio_file:
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="srt"
            )
        return transcript
