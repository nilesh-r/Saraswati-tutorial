import os
import re

color_keywords = ["blue", "indigo", "purple", "violet", "pink", "rose", "emerald", "green", "teal", "cyan", "sky", "yellow", "amber", "red", "orange", "fuchsia", "lime"]
exclude_dirs = {'.git', 'node_modules', '.venv', 'dist', 'build'}

results = []

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(('.jsx', '.js', '.html', '.css')) and file not in ('find_colors.py', 'find_colors2.py'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f, 1):
                        found_colors = []
                        for kw in color_keywords:
                            # search for color keywords as tailwind classes or general colors
                            # e.g., text-blue-500, bg-green-200, fill-amber-500
                            # but skip lucide icon imports like "import { Moon, Sun } from 'lucide-react';" unless they match classes
                            # We can search for pattern matching tailwind classes or hex colors
                            if re.search(r'\b(bg|text|border|from|to|via|ring|outline|fill|stroke|divide|placeholder)-' + kw + r'\b', line, re.I):
                                found_colors.append(kw)
                            elif re.search(r'\b' + kw + r'-(?:50|100|200|300|400|500|600|700|800|900|950)\b', line, re.I):
                                found_colors.append(kw)
                        
                        # Find hex colors that are not neutral greys
                        hex_matches = re.findall(r'#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})', line)
                        for h in hex_matches:
                            if len(h) == 6:
                                r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
                                if not (abs(r - g) < 15 and abs(g - b) < 15):
                                    found_colors.append(f"#{h}")
                            elif len(h) == 3:
                                r, g, b = int(h[0]*2, 16), int(h[1]*2, 16), int(h[2]*2, 16)
                                if not (abs(r - g) < 15 and abs(g - b) < 15):
                                    found_colors.append(f"#{h}")
                        
                        if found_colors:
                            results.append((filepath, i, line.strip(), found_colors))
            except Exception as e:
                pass

with open('colors_report.txt', 'w', encoding='utf-8') as out:
    out.write(f"Found {len(results)} color occurrences:\n")
    for filepath, line_num, line_content, colors in results:
        out.write(f"{filepath}:{line_num} -> {colors} -> {line_content}\n")

print(f"Done! Found {len(results)} occurrences. Written to colors_report.txt")
# print breakdown by file
files_summary = {}
for filepath, _, _, _ in results:
    files_summary[filepath] = files_summary.get(filepath, 0) + 1
for f, count in sorted(files_summary.items(), key=lambda x: x[1], reverse=True):
    print(f"  {f}: {count} occurrences")
