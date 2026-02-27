const fs = require('fs');
const path = 'd:\\Nandini\\Projects\\Web Devlopement\\WebHackthon\\new_hack\\client\\pages\\Suppliers.tsx';
let content = fs.readFileSync(path, 'utf8');
// Fix the broken closing block: ))}\n          </div>
// We need to find the pattern   </div>\n                ))}\n          </div>
// and replace it with proper closing
const broken = '                  </div>\r\n                ))}\r\n          </div>';
const fixed = '                  </div>\r\n                );\r\n              })\r\n            )}\r\n          </div>';
if (content.includes(broken)) {
    content = content.replace(broken, fixed);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed successfully!');
} else {
    // Try without CRLF
    const broken2 = '                  </div>\n                ))}\n          </div>';
    const fixed2 = '                  </div>\n                );\n              })\n            )}\n          </div>';
    if (content.includes(broken2)) {
        content = content.replace(broken2, fixed2);
        fs.writeFileSync(path, content, 'utf8');
        console.log('Fixed (LF version)!');
    } else {
        console.log('Pattern not found. Searching...');
        const idx = content.indexOf('))}\n          </div>');
        const idx2 = content.indexOf('))}\r\n          </div>');
        console.log('CRLF idx:', idx2, ' LF idx:', idx);
        console.log('Context:', JSON.stringify(content.substring(Math.max(0, idx2 > -1 ? idx2 - 50 : idx - 50), Math.min(content.length, (idx2 > -1 ? idx2 : idx) + 100))));
    }
}
