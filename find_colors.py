import os
import re

color_pattern = re.compile(
    r'\b(?:bg|text|border|from|to|via|ring|outline|divide|placeholder)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|violet)-\d+'
    r'|\b(?:bg|text|border|from|to|via|ring|outline|divide|placeholder)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|violet)\b'
    r'|#([a-fA-F0-9]{3,8})'
)

# Skip certain CSS/HEX styles that might be pure grey, black, or white
# We want to identify any remaining purple, blue, green, pink, yellow etc. colors.
# Specifically standard Tailwind color words:
color_keywords = ["blue", "indigo", "purple", "violet", "pink", "rose", "emerald", "green", "teal", "cyan", "sky", "yellow", "amber", "red", "orange", "fuchsia", "lime"]

exclude_dirs = {'.git', 'node_modules', '.venv', 'dist', 'build'}

results = []

for root, dirs, files in os.walk('.'):
    # filter out excluded dirs
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(('.jsx', '.js', '.html', '.css')) and file != 'find_colors.py':
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f, 1):
                        found_colors = []
                        # search for keyword colors
                        for kw in color_keywords:
                            if re.search(r'\b' + kw + r'\b', line, re.I):
                                found_colors.append(kw)
                        # search for custom colors
                        if "#" in line:
                            # find colors like #7c3aed
                            hex_matches = re.findall(r'#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})', line)
                            for h in hex_matches:
                                # if not grey/black/white (where R=G=B)
                                if len(h) == 6:
                                    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
                                    if not (abs(r - g) < 10 and abs(g - b) < 10):
                                        found_colors.append(f"#{h}")
                                elif len(h) == 3:
                                    r, g, b = int(h[0]*2, 16), int(h[1]*2, 16), int(h[2]*2, 16)
                                    if not (abs(r - g) < 10 and abs(g - b) < 10):
                                        found_colors.append(f"#{h}")
                        
                        if found_colors:
                            results.append((filepath, i, line.strip(), found_colors))
            except Exception as e:
                pass

print(f"Found {len(results)} color occurrences:")
for filepath, line_num, line_content, colors in results[:100]:
    print(f"{filepath}:{line_num} -> {colors} -> {line_content[:100]}")
if len(results) > 100:
    print(f"... and {len(results) - 100} more occurrences.")
