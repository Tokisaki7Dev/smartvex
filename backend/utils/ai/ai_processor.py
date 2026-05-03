import openai
import os

# Processamento de transcrição com Whisper via API
def transcribe_video(file_path: str):
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    with open(file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file,
            response_format="srt"
        )
    return transcript
