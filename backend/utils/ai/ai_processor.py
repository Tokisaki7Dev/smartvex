import openai
import os
import logging

logger = logging.getLogger("SmartVex.AIProcessor")

class AIProcessor:
    def __init__(self):
        # A chave de API deve ser configurada como OPENAI_API_KEY no Render
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def transcribe_video(self, file_path: str):
        """Transcreve vídeo/áudio usando Whisper e retorna SRT."""
        try:
            logger.info(f"Iniciando transcrição de: {file_path}")
            with open(file_path, "rb") as audio_file:
                # O Whisper aceita arquivos de vídeo diretamente na API
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file,
                    response_format="srt"
                )
            logger.info("Transcrição concluída com sucesso.")
            return transcript
        except Exception as e:
            logger.error(f"Erro industrial na transcrição: {e}")
            raise Exception(f"TranscriptionFailed: {str(e)}")
