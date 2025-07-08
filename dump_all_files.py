import os

# File where the full dump will be stored
DUMP_FILE = "all_code_dump.txt"

# Extensions to include (edit based on your tech stack)
INCLUDE_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".py", ".html", ".css", ".json"}

def collect_code_lines(base_path="."):
    all_lines = []

    for root, _, files in os.walk(base_path):
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext.lower() in INCLUDE_EXTENSIONS:
                filepath = os.path.join(root, file)

                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.readlines()
                except Exception as e:
                    print(f" Skipping {filepath}: {e}")
                    continue

                all_lines.append(f"\n\n--- FILE: {filepath} ---\n")
                all_lines.extend(content)

    return all_lines

def write_dump(lines):
    with open(DUMP_FILE, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"All code lines dumped to: {DUMP_FILE}")

if __name__ == "__main__":
    code_lines = collect_code_lines()
    write_dump(code_lines)
