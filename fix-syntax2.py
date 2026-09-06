with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col  }>',
    '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col  }>'
)
code = code.replace(
    '<div className={max-w-6xl mx-auto w-full flex-1 flex flex-col }>',
    '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col  }>'
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

