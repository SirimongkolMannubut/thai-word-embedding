import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix syntax error on main wrapper
code = code.replace(
    '<div className={max-w-6xl mx-auto w-full flex-1 flex flex-col  }>',
    '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col  }>'
)
code = code.replace(
    '<div className={max-w-6xl mx-auto w-full flex-1 flex flex-col }>',
    '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col  }>'
)

old_header = '''<div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_rgb(139,92,246,0.4)] ring-1 ring-white/20">
            <Music size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-[clamp(1.25rem,4vw,1.5rem)] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 leading-tight tracking-tight">Thai Song Finder</h1>
            <p className="text-[clamp(0.65rem,2vw,0.85rem)] text-slate-500">ค้นหาจากเนื้อเพลง • พูดก็ได้</p>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full max-w-4xl relative group">'''

new_header = '''<div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4 lg:gap-8 mb-4 lg:mb-6">
          {/* Brand */}
          <div className="flex items-center justify-center lg:justify-start gap-3 w-full lg:w-[260px] flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_rgb(139,92,246,0.4)] ring-1 ring-white/20">
              <Music size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-[clamp(1.1rem,4vw,1.25rem)] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 leading-tight tracking-tight">Thai Song Finder</h1>
              <p className="text-[clamp(0.6rem,2vw,0.75rem)] text-slate-500">ค้นหาจากเนื้อเพลง • พูดก็ได้</p>
            </div>
          </div>

          {/* Search Input */}
          <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full max-w-4xl flex-1 relative group">'''

code = code.replace(old_header, new_header)

old_search_close = '''</div>
        </div>
        </form>'''

new_search_close = '''</div>
        </div>
        </form>
        {/* Spacer for centering search on large screens */}
        <div className="hidden lg:block lg:w-[260px] flex-shrink-0"></div>
        </div>'''

code = code.replace(old_search_close, new_search_close)

code = code.replace(
    '<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 w-full max-w-5xl mt-6 md:mt-10">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 w-full max-w-6xl mt-6 md:mt-10">'
)

code = code.replace(
    '<div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mt-4 pb-1">',
    '<div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-2.5 pb-1 w-full lg:pl-[292px]">'
)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
