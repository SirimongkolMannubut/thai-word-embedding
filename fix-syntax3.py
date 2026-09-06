import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace it using regex to catch all variations
code = re.sub(
    r'<div className=\{max-w-\[?1400px\]? mx-auto w-full flex-1 flex flex-col\s*\}>',
    '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col }>',
    code
)

code = re.sub(
    r'<div className=\{max-w-6xl mx-auto w-full flex-1 flex flex-col\s*\}>',
    '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col }>',
    code
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

