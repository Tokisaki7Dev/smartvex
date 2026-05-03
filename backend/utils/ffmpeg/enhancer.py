import subprocess
import multiprocessing
import re
from typing import Callable

def enhance_video(input_path: str, output_path: str, progress_callback: Callable = None):
    threads = multiprocessing.cpu_count()
    
    # ffprobe para duração
    cmd_probe = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", input_path]
    duration = float(subprocess.check_output(cmd_probe))

    cmd = [
        "ffmpeg", "-i", input_path,
        "-threads", str(threads),
        "-vf", "unsharp=5:5:1.0:5:5:0.0,hqdn3d=1.5:1.5:6:6,eq=contrast=1.1:brightness=0.05",
        "-c:v", "libx264", "-preset", "slow", "-crf", "18",
        "-c:a", "copy", output_path, "-y"
    ]

    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
    time_regex = re.compile(r"time=(\d{2}):(\d{2}):(\d{2})")

    for line in process.stdout:
        match = time_regex.search(line)
        if match and progress_callback:
            h, m, s = map(int, match.groups())
            progress = int(((h * 3600 + m * 60 + s) / duration) * 100)
            progress_callback(min(progress, 100))
    
    process.wait()
