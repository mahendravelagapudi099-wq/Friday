
import os
import sys
import numpy as np
import sounddevice as sd
import io
import wave

# Add the source directory to sys.path
sys.path.append(os.getcwd())

from brain.voice.tts import TTS

def test_audio_out(wav_bytes, sample_rate):
    print(f"Playing {len(wav_bytes)} bytes at {sample_rate}Hz")
    try:
        # Standard WAV header is 44 bytes
        header = wav_bytes[:44]
        print(f"WAV Header: {header.hex(' ')}")
        
        # Better way to get raw data
        with wave.open(io.BytesIO(wav_bytes), 'rb') as w:
            n_channels = w.getnchannels()
            sampwidth = w.getsampwidth()
            framerate = w.getframerate()
            n_frames = w.getnframes()
            print(f"Wave info: channels={n_channels}, width={sampwidth}, rate={framerate}, frames={n_frames}")
            raw_data = w.readframes(n_frames)
            
        audio_array = np.frombuffer(raw_data, dtype=np.int16)
        print(f"Audio array shape: {audio_array.shape}, max amplitude: {np.max(np.abs(audio_array))}")
        
        sd.play(audio_array, sample_rate)
        sd.wait()
        print("Playback finished")
    except Exception as e:
        print(f"Playback error: {e}")

def main():
    print("Testing TTS Backends...")
    
    # Try to init TTS
    try:
        # Try mock first to verify playback logic
        tts = TTS(prefer="mock")
        print(f"Using backend: {tts.backend_name}")
        result = tts.speak("Hello, I am testing the audio output.")
        test_audio_out(result.wav_bytes, result.sample_rate)
        
        # Try pyttsx3
        print("\nTesting pyttsx3...")
        try:
            tts_py = TTS(prefer="pyttsx3")
            print(f"Using backend: {tts_py.backend_name}")
            result = tts_py.speak("This is a test of the system voice.")
            test_audio_out(result.wav_bytes, result.sample_rate)
        except Exception as e:
            print(f"pyttsx3 failed: {e}")

    except Exception as e:
        print(f"Error in main: {e}")

if __name__ == "__main__":
    main()
