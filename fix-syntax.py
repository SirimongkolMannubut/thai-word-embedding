import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Bruteforce fix the div!
code = re.sub(
    r'<div className=\{max-w-\[1400px\] mx-auto w-full flex-1 flex flex-col  \}>',
    '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col  }>',
    code
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

