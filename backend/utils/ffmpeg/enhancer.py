import subprocess
import multiprocessing
import re
import logging
from typing import Callable, Optional

# Configuração de Logs Profissional
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartVex.VideoProcessor")

class VideoProcessor:
    def __init__(self, input_path: str):
        self.input_path = input_path
        self.threads = multiprocessing.cpu_count()
        self.duration = self._get_duration()

    def _get_duration(self) -> float:
        try:
            cmd = [
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", self.input_path
            ]
            result = subprocess.check_output(cmd, stderr=subprocess.STDOUT)
            return float(result.strip())
        except Exception as e:
            logger.error(f"Erro ao obter duração: {e}")
            return 0.0

    def run_ffmpeg(self, filters: str, output_path: str, progress_callback: Optional[Callable] = None):
        cmd = [
            "ffmpeg", "-y", "-i", self.input_path,
            "-threads", str(self.threads),
            "-vf", filters,
            "-c:v", "libx264", "-preset", "slow", "-crf", "18",
            "-c:a", "copy", output_path
        ]

        try:
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE, # Capturar erros detalhados
                universal_newlines=True
            )

            # Regex precisa para HH:MM:SS.ms
            time_regex = re.compile(r"time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})")

            # Processar stdout e stderr para progresso e erros
            while True:
                line = process.stderr.readline()
                if not line and process.poll() is not None:
                    break
                
                if line:
                    match = time_regex.search(line)
                    if match and progress_callback and self.duration > 0:
                        h, m, s, ms = map(int, match.groups())
                        current_time = h * 3600 + m * 60 + s + (ms / 100)
                        progress = min(int((current_time / self.duration) * 100), 100)
                        progress_callback(progress)

            process.wait()
            if process.returncode != 0:
                raise Exception(f"FFmpeg falhou com código {process.returncode}")
        
        except Exception as e:
            logger.error(f"Erro industrial no processamento: {e}")
            raise Exception(f"VideoProcessingFailed: {str(e)}")

    def detect_silence(self, threshold="-30dB", duration=1.0):
        cmd = [
            "ffmpeg", "-i", self.input_path,
            "-af", f"silencedetect=n={threshold}:d={duration}",
            "-f", "null", "-"
        ]
        result = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
        # Extrai os tempos de silêncio do stderr
        silence_start = re.findall(r"silence_start: (\d+\.?\d*)", result.stderr)
        silence_end = re.findall(r"silence_end: (\d+\.?\d*)", result.stderr)
        return list(zip(silence_start, silence_end))

    def convert_format(self, output_path: str, resolution="1080x1920"):
        # Otimizado para TikTok/Reels (9:16)
        cmd = [
            "ffmpeg", "-y", "-i", self.input_path,
            "-vf", f"scale={resolution}:force_original_aspect_ratio=decrease,pad={resolution}:(ow-iw)/2:(oh-ih)/2",
            "-c:v", "libx264", "-crf", "20",
            output_path
        ]
        subprocess.run(cmd)

def enhance_video(input_path: str, output_path: str, progress_callback: Optional[Callable] = None):
    processor = VideoProcessor(input_path)
    filters = "unsharp=5:5:1.0:5:5:0.0,hqdn3d=1.5:1.5:6:6,eq=contrast=1.1:brightness=0.05"
    processor.run_ffmpeg(filters, output_path, progress_callback)
