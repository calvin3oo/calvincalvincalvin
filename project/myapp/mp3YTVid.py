from pytube import YouTube
from pydub import AudioSegment
import os

def download_youtube_video_as_mp3(youtube_url, output_path):
    try:
        # Download the video
        yt = YouTube(youtube_url)
        stream = yt.streams.filter(only_audio=True).first()
        downloaded_file = stream.download(output_path)

        # Convert to MP3
        base, ext = os.path.splitext(downloaded_file)
        mp3_file = base + '.mp3'

        audio = AudioSegment.from_file(downloaded_file)
        audio.export(mp3_file, format='mp3')

        # Clean up the original downloaded file
        os.remove(downloaded_file)

        print(f'MP3 file saved as: {mp3_file}')
    except Exception as e:
        print(f'An error occurred: {e}')

# Example usage
youtube_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
output_path = './'  # You can set your desired output path here
download_youtube_video_as_mp3(youtube_url, output_path)
