# from pytube import YouTube
# from pydub import AudioSegment
from pytubefix import YouTube
from pytubefix.cli import on_progress
import os
import librosa
import numpy as np

def download_youtube_audio_as_mp3(youtube_url):
    try:
      yt = YouTube(youtube_url, on_progress_callback = on_progress)
      print(yt.title)
      
      ys = yt.streams.get_audio_only()
      ys.download(mp3=True)
      
      return yt.title + '.mp3'
    except Exception as e:
        print(f'An error occurred: {e}')
        
def analyze_audio(file_path):
  y, sr = librosa.load(file_path)
  
  # Get the tempo and beat frames
  tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
  
  # Get pitch and magnitude
  pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
  
  notes = []
  for t in range(pitches.shape[1]):
    index = magnitudes[:, t].argmax()
    pitch = pitches[index, t]
    if pitch > 0:
      note_time = librosa.frames_to_time(t, sr=sr)
      notes.append((note_time, pitch))
  
  return tempo, notes


def pitch_to_track(pitch):
  if pitch < 200:
    return 0
  elif pitch < 400:
    return 1
  elif pitch < 600:
    return 2
  elif pitch < 800:
    return 3
  else:
    return 4

def generate_rhythm_game_code(notes):
  rhythm_code = []
  count = 0
  interval = 20 # every 20 frames, a new line is added to the rhythm code
  sum_pitch = 0
  for note_time, pitch in notes:
    count += 1
    sum_pitch += pitch
    if(count % interval == (interval-1)):
      track_number = pitch_to_track(sum_pitch / interval)
      rhythm_code.append(f"{track_number};{note_time:.2f}")
      sum_pitch = 0
  return rhythm_code

youtube_url = 'https://www.youtube.com/watch?v=LHd447EafFY'  
fileName = download_youtube_audio_as_mp3(youtube_url)
# fileName = "Donald Trump speaks for the 1st time on the assassination attempt.mp3"
# fileName = "C:/Users/calvi/Code/calvincalvincalvin/Donald Trump speaks for the 1st time on the assassination attempt.mp3"
tempo, notes = analyze_audio(fileName)

rhythm_code = generate_rhythm_game_code(notes)
# for line in rhythm_code:
#   print(line)

print(f'Tempo: {tempo} beats per minute')

# save rythm_code to a file

with open('rhythm_code.txt', 'w') as f:
  for line in rhythm_code:
    f.write(line + '\n')

print('Rhythm code saved to rhythm_code.txt')


# delete the downloaded file after conversion
# os.remove(fileName)