const fs = require('fs');
const filePath = 'D:\\Nandini\\Projects\\Web Devlopement\\WebHackthon\\new_hack\\client\\pages\\Suppliers.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings for search
const brokenPattern = '                  </div>\r\n                ))}\r\n          </div>';
const fixedPattern = '                  </div>\r\n                );\r\n              })\r\n            )}\r\n          </div>';

if (content.includes(brokenPattern)) {
    content = content.replace(brokenPattern, fixedPattern);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed CRLF version successfully!');
} else {
    const broken2 = '                  </div>\n                ))}\n          </div>';
    const fixed2 = '                  </div>\n                );\n              })\n            )}\n          </div>';
    if (content.includes(broken2)) {
        content = content.replace(broken2, fixed2);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed LF version successfully!');
    } else {
        // Debug: find what's there
        const idx = content.indexOf('))}\n');
        const idx2 = content.indexOf('))}\r\n');
        console.log('LF idx:', idx, 'CRLF idx:', idx2);
        if (idx2 > -1) {
            console.log('Context:', JSON.stringify(content.substring(Math.max(0, idx2 - 80), idx2 + 60)));
        } else if (idx > -1) {
            console.log('Context:', JSON.stringify(content.substring(Math.max(0, idx - 80), idx + 60)));
        } else {
            console.log('Pattern ))}} not found at all');
        }
    }
}
