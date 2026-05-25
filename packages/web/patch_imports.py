import os
import re

files_to_patch = [
    'services/api.ts',
    'hooks/api/useAdmin.ts',
    'hooks/api/useMentor.ts',
    'app/admin/mentors/[id]/schedule/page.tsx',
    'app/admin/outcomes/page.tsx',
    'app/admin/programs/[id]/page.tsx',
    'app/admin/reports/generate/page.tsx',
    'app/admin/students/[id]/page.tsx',
    'app/mentor/schedule/page.tsx'
]

types_to_extract = ['Student', 'Mentor', 'Program', 'Track', 'Activity', 'Outcome', 'MentorSchedule', 'AssignedStudent']

for filepath in files_to_patch:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def replacer(match):
        imports = match.group(1)
        source = match.group(2)
        
        types = []
        others = []
        for imp in imports.split(','):
            imp = imp.strip()
            if not imp: continue
            
            imp_name = imp.replace('type ', '').strip()
            if imp_name in types_to_extract:
                types.append('type ' + imp_name)
            else:
                others.append(imp)
                
        res = ''
        if others:
            res += f'import {{ { ", ".join(others)} }} from \'{source}mockData\';\n'
        if types:
            res += f'import {{ { ", ".join(types)} }} from \'@/types/models\';\n'
            
        return res

    new_content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+[\'\"](.*?)mockData[\'\"];', replacer, content)
    
    if filepath == 'services/api.ts':
        new_content = new_content.replace("'@/types/models'", "'../types/models'")
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Patched {filepath}')
