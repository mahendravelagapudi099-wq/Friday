import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('E:/NeuroLinked-V1.3-SOURCE/server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = [
    '\n',
    '@app.post("/api/vision/analyze")\n',
    'async def analyze_vision():\n',
    '    try:\n',
    '        if not vision_encoder or not vision_encoder.active:\n',
    '            return {"analysis": None, "error": "Vision not active"}\n',
    '        frame = vision_encoder.get_current_frame()\n',
    '        if frame is None:\n',
    '            return {"analysis": None, "error": "No frame captured"}\n',
    '        import base64\n',
    '        frame_b64 = base64.b64encode(frame).decode()\n',
    '        try:\n',
    '            completion = client.chat.completions.create(\n',
    '                model="microsoft/phi-4-vision",\n',
    '                messages=[{"role": "user", "content": [{"type": "text", "text": "Describe what you see concisely in 1-2 sentences."}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{frame_b64}"}}]}] ,\n',
    '                temperature=0.5,\n',
    '                max_tokens=200,\n',
    '            )\n',
    '            analysis = completion.choices[0].message.content.strip()\n',
    '        except Exception as model_err:\n',
    '            print(f"[VISION] Vision model error: {model_err}")\n',
    '            completion = client.chat.completions.create(\n',
    '                model="deepseek-ai/deepseek-v4-flash",\n',
    '                messages=[\n',
    '                    {"role": "system", "content": "You are FRIDAY with vision. Describe what you see in 1-2 sentences."},\n',
    '                    {"role": "user", "content": "Describe what the camera sees right now."}\n',
    '                ],\n',
    '                temperature=0.5,\n',
    '                max_tokens=150,\n',
    '            )\n',
    '            analysis = completion.choices[0].message.content.strip()\n',
    '        return {"analysis": analysis, "error": None}\n',
    '    except Exception as e:\n',
    '        return {"analysis": None, "error": str(e)}\n',
    '\n',
]

lines[387:387] = new_lines
with open('E:/NeuroLinked-V1.3-SOURCE/server.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Done, new line count:", len(lines))
