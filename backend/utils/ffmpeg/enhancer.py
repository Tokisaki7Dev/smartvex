import subprocess
import os
import multiprocessing
import re
import json
from typing import Callable

def get_video_duration(file_path: str) -> float:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", file_path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    return float(result.stdout)

def enhance_video(input_path: str, output_path: str, progress_callback: Callable = None):
    """
    Optimized Video Enhancer for Xeon Processors
    Filters: unsharp (sharpness), hqdn3d (denoise), eq (contrast/brightness)
    """
    threads = multiprocessing.cpu_count()
    
    total_duration = get_video_duration(input_path)
    if total_duration == 0:
        raise Exception("Could not determine video duration.")

    # FFmpeg Command
    # unsharp: luma_matrix_width:luma_matrix_height:luma_amount:chroma_matrix_width:chroma_matrix_height:chroma_amount
    # hqdn3d: ls:cs:lt:ct
    # eq: contrast:brightness:saturation:gamma
    
    cmd = [
        "ffmpeg", "-i", input_path,
        "-threads", str(threads),
        "-vf", "unsharp=5:5:1.0:5:5:0.0,hqdn3d=1.5:1.5:6:6,eq=contrast=1.1:brightness=0.05",
        "-c:v", "libx264", "-preset", "slow", "-crf", "18",
        "-c:a", "copy",
        output_path,
        "-y"
    ]

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True
    )

    # Regex to extract time from FFmpeg output
    time_regex = re.compile(r"time=(\d{2}):(\d{2}):(\d{2})\.\d{2}")

    for line in process.stdout:
        match = time_regex.search(line)
        if match:
            h, m, s = map(int, match.groups())
            current_time = h * 3600 + m * 60 + s
            progress = int((current_time / total_duration) * 100)
            if progress_callback and progress <= 100:
                progress_callback(progress)
    
    process.wait()
    if process.returncode != 0:
        raise Exception(f"FFmpeg failed with return code {process.returncode}. Output: {process.stdout.read()}")

    return output_path

