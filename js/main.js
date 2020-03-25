const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test(str)

function convert(raw) {

  let arr = raw.split(/\n(?=\s*#)/).filter(s => s !== '').map(s => s.trim())
  console.log(arr);

  let html = ''
  for (let i = 0; i < arr.length; i++) {

    if (arr[i + 1] !== undefined) {
      if (isMain(arr[i]) && isMain(arr[i + 1])) {

        html += `
        <section  data-markdown>
          <textarea data-template>
            ${arr[i]}
          </textarea>
        </section>
        `
      } else if (isMain(arr[i]) && isSub(arr[i + 1])) {

        html += `
        <section>
          <section  data-markdown>
            <textarea data-template>
              ${arr[i]}
            </textarea>
          </section>
        `
      } else if (isSub(arr[i]) && isSub(arr[i + 1])) {

        html += `
      <section  data-markdown>
        <textarea data-template>
          ${arr[i]}
        </textarea>
      </section>
      `
      } else if (isSub(arr[i]) && isMain(arr[i + 1])) {

        html += `
        <section  data-markdown>
          <textarea data-template>
            ${arr[i]}
          </textarea>
        </section>
      </section>
      `
      }
    } else {
      if (isMain(arr[i])) {
        html += `
        <section  data-markdown>
          <textarea data-template>
            ${arr[i]}
          </textarea>
        </section>
      `
      } else if (isSub(arr[i])) {
        html += `
          <section  data-markdown>
            <textarea data-template>
              ${arr[i]}
            </textarea>
          </section>
        </section>
        `
      }
    }
  }
  return html
}
function loadMarkdown(raw) {
  localStorage.markdown = convert(raw)

  location.reload()

}

function start() {
  let TPL = '# My Slide'
  let html = convert(localStorage.markdown || TPL)


  document.querySelector('.slides').innerHTML = html
  Reveal.initialize({
    controls: true,
    progress: true,
    center: true,
    hash: true,

    transition: 'slide', // none/fade/slide/convex/concave/zoom

    // More info https://github.com/hakimel/reveal.js#dependencies
    dependencies: [
      { src: 'plugin/markdown/marked.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
      { src: 'plugin/markdown/markdown.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
      { src: 'plugin/highlight/highlight.js' },
      { src: 'plugin/search/search.js', async: true },
      { src: 'plugin/zoom-js/zoom.js', async: true },
      { src: 'plugin/notes/notes.js', async: true }
    ]
  });
}