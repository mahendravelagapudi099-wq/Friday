lines = open("E:/NeuroLinked-V1.3-SOURCE/server.py", "r", encoding="utf-8").readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.strip().startswith("@app.post(\"/api/vision/analyze\""):
        # Skip old endpoint lines until we find the next @app or empty line after it
        i += 1
        while i < len(lines):
            if lines[i].strip().startswith("@app.") or (lines[i].strip() == "" and i > 0 and lines[i-1].strip().startswith("return")):
                break
            i += 1
        # Insert new endpoint
        new_lines.append("\n")
        new_lines.append("@app.post(\"/api/vision/analyze\")\n")
        new_lines.append("async def analyze_vision():\n")
        new_lines.append("    try:\n")
        new_lines.append("        if not vision_encoder or not vision_encoder.active:\n")
        new_lines.append("            return {\"analysis\": None, \"error\": \"Vision not active\"}\n")
        new_lines.append("        frame = vision_encoder.last_frame\n")
        new_lines.append("        if frame is None:\n")
        new_lines.append("            return {\"analysis\": None, \"error\": \"No frame captured\"}\n")
        new_lines.append("        import base64\n")
        new_lines.append("        frame_b64 = base64.b64encode(frame).decode()\n")
        new_lines.append("        frame_url = \"data:image/jpeg;base64,\" + frame_b64\n")
        new_lines.append("        try:\n")
        new_lines.append("            completion = client.chat.completions.create(\n")
        new_lines.append("                model=\"microsoft/phi-4-vision\",\n")
        new_lines.append("                messages=[{\"role\": \"user\", \"content\": [{\"type\": \"text\", \"text\": \"Describe what you see concisely in 1-2 sentences.\"}, {\"type\": \"image_url\", \"image_url\": {\"url\": frame_url}}]}],\n")
        new_lines.append("                temperature=0.5,\n")
        new_lines.append("                max_tokens=200,\n")
        new_lines.append("            )\n")
        new_lines.append("            analysis = completion.choices[0].message.content.strip()\n")
        new_lines.append("        except Exception as model_err:\n")
        new_lines.append("            print(f\"[VISION] Vision model error: {model_err}\")\n")
        new_lines.append("            completion = client.chat.completions.create(\n")
        new_lines.append("                model=\"deepseek-ai/deepseek-v4-flash\",\n")
        new_lines.append("                messages=[\n")
        new_lines.append("                    {\"role\": \"system\", \"content\": \"You are FRIDAY with vision. Describe what you see in 1-2 sentences.\"},\n")
        new_lines.append("                    {\"role\": \"user\", \"content\": \"Describe what the camera sees right now.\"}\n")
        new_lines.append("                ],\n")
        new_lines.append("                temperature=0.5,\n")
        new_lines.append("                max_tokens=150,\n")
        new_lines.append("            )\n")
        new_lines.append("            analysis = completion.choices[0].message.content.strip()\n")
        new_lines.append("        return {\"analysis\": analysis, \"error\": None}\n")
        new_lines.append("    except Exception as e:\n")
        new_lines.append("        return {\"analysis\": None, \"error\": str(e)}\n")
        new_lines.append("\n")
        continue
    new_lines.append(line)
    i += 1

open("E:/NeuroLinked-V1.3-SOURCE/server.py", "w", encoding="utf-8").writelines(new_lines)
print("Done, lines:", len(new_lines))
