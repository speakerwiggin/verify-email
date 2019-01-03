const { spawnSync } = require('child_process')
const fs = require('fs')
const parse = require('emailjs-mime-parser').default

const filename = process.argv[2]
if (!filename) {
  process.stderr.write('must pass path to raw email source as argument\n')
  process.exit(1)
}

const file = fs.readFileSync(filename)
const result = parse(file)

if (result._isMultipart !== 'signed') {
  process.stderr.write('email is not signed; nothing to verify\n')
  process.exit(1)
}

const body = result.childNodes[0].raw
const sig = String.fromCharCode.apply(null, result.childNodes[1].content)

fs.writeFileSync(process.cwd() + '/.body.txt', body)
fs.writeFileSync(process.cwd() + '/.sig.asc', sig)

const { status } = spawnSync('gpg', ['--verify', '.sig.asc', '.body.txt'], {
  cwd: process.cwd(),
  stdio: ['inherit', 'inherit', 'inherit']
})
fs.unlinkSync('./.body.txt')
fs.unlinkSync('./.sig.asc')
process.exit(status)
