const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)

const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test(str)

const convert = (raw)=> {
  let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(s => s !== '').map(s => s.trim())
  
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

const Menu ={
  init(){
    this.$settingIcon = $('.control .icon-setting')
    this.$menu = $('.menu')
    this.$closeIcon = $('.icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')
    this.bind()
  },
  bind(){
    this.$settingIcon.onclick = ()=>{
      this.$menu.classList.add('open')
    }
    this.$closeIcon.onclick = ()=>{
      this.$menu.classList.remove('open')
    }
    this.$$tabs.forEach($tab => $tab.onclick=()=>{
      this.$$tabs.forEach($node =>
        $node.classList.remove('active'))
        $tab.classList.add('active')
        let index = [...this.$$tabs].indexOf($tab)
        this.$$contents.forEach($content=>{
          $content.classList.remove('active')
          this.$$contents[index].classList.add('active')
        })
      
    })
  }
}

const ImgUploader = {
  init(){
    this.$fileInput = $('#img-uploader')
    this.$textarea = $('.editor textarea')

  AV.init({
    appId: "1gg3IGShxRHk4dkECl1ue9dh-gzGzoHsz",
    appKey: "zgwk0WMUPariQhAVrsQrnTFi",
    serverURLs: "https://1gg3igsh.lc-cn-n1-shared.com"
  });

    this.bind()
  },
  bind(){
    let self = this
    this.$fileInput.onchange = function(){
      if(this.files.length > 0){
        let localFile = this.files[0]
        if(localFile.size/1048576 > 2){
          alert('文件不能超过2M')
          return
        }
        self.insertText(`![上传中，进度0%]（）`)        
        let avFile = new AV.File(encodeURI(localFile.name), localFile)
        avFile.save({
          keepFileName: true, 
          onprogress(progress) {
            self.insertText(`![上传中，进度${progress.percent}%]()`)
          }
        }).then(file => {
          console.log('文件保存完成');
          // 高度固定，宽度为自身宽度
          let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`
          self.insertText(text)
        }).catch(err => console.log(err))
      }
    }
  },
  insertText(text= ''){
    let $textarea = this.$textarea 
    let start = $textarea.selectionStart
    let end = $textarea.selectionEnd
    let oldText = $textarea.value

    $textarea.value = `${oldText.substring(0, start)}${text}${oldText.substring(end)}`
    $textarea.focus()
    $textarea.setSelectionRange(start, start + text.length)
  }
}

const Editor ={
  init(){
    this.$editInput = $('.editor textarea')
    this.$saveBtn = $('.editor .button-save')
    this.initialValue = `# One Slide
__把做PPT变成像呼吸一样简单__

*如果你想直接开始使用，请把鼠标放在**页面顶部**，点击设置按钮开始编辑。*

## 特点
* 效率
- 美观
+ 极致体验

## 如何使用

### 第一步
鼠标放在页面顶部，点击设置按钮

### 第二步
点击侧边栏内容编辑

### 第三步
用**markdown语法**编辑内容，其中
- 一级标题#是PPT封面的大标题
- 二级标题##是PPT一级页面标题
- 三级标题###是PPT二级子页面标题
- 更多markdown语法请点击设置中的**帮助选项**查看
### 第四步
点击保存，即可预览

## 更多功能
- 更换主题
- 演讲者模式（按S）
- 全屏模式（按F）
- PDF下载
      `
    this.markdown = localStorage.markdown || this.initialValue
    this.$slideContainer = $('.slides')

    this.bind()
    this.start()
  },
  bind(){
    this.$saveBtn.onclick = ()=>{
      localStorage.markdown = this.$editInput.value
      location.reload()
    }
  },
  start(){
    this.$editInput.innerHTML = this.markdown
    this.$slideContainer.innerHTML = convert(this.markdown)
    Reveal.initialize({
      controls: true,
      progress: true,
      center: localStorage.align === 'left-top' ? false : true,
      hash: true,
  
      transition: localStorage.transition || 'slide', // none/fade/slide/convex/concave/zoom
  
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
}

const Theme = {
  init(){
    this.$$figures = $$('.theme figure')
    this.$transition = $('.theme .transition')
    this.$align = $('.theme .align')
    this.$reveal = $('.reveal')

    this.bind()
    this.loadTheme()
  },
  bind(){
    this.$$figures.forEach($figure => $figure.onclick = () => {
      this.$$figures.forEach($item => $item.classList.remove('select'))
      $figure.classList.add('select')
      this.setTheme($figure.dataset.theme)
    })

    this.$transition.onchange = function(){
      localStorage.transition = this.value
      location.reload()
    }
    this.$align.onchange = function(){
      localStorage.align =  this.value
      location.reload()
    }
  },
  setTheme(theme){
    localStorage.theme = theme
    location.reload()
  },
  loadTheme(){
    let theme = localStorage.theme || 'league' 
    let $link = document.createElement('link')
    $link.rel = 'stylesheet'
    $link.href = `css/theme/${theme}.css`
    document.head.appendChild($link)

    Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme).classList.add('select')
    this.$transition.value = localStorage.transition || 'slide'
    this.$align.value = localStorage.align || 'center'
    this.$reveal.classList.add(this.$align.value)
  }
}

const Print = {
  init(){
    this.$download = $('.download')

    this.bind()
    this.start()
  },
  bind(){
    // 防止覆盖之前的click事件
    this.$download.addEventListener('click', ()=>{
      let $link = document.createElement('a')
      $link.setAttribute('target', '_blank')
      $link.setAttribute('href', location.href.replace(/#\/.*/,'?print-pdf'))
      $link.click()
    })
  },
  start(){
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    if(window.location.search.match(/print-pdf/gi)){
      link.href = 'css/print/pdf.css' ;
      window.print()
    }else{
      link.href = 'css/print/paper.css'
    }
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

const App = {
  init(){
    [...arguments].forEach(Module=>Module.init())
  }
}

App.init(Menu,Editor,Theme,Print,ImgUploader)