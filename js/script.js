'use strict';

window.addEventListener('DOMContentLoaded', () => {
    //Tabs
    const tabs = document.querySelectorAll('.tabheader__item'),
        tabParent = document.querySelector('.tabheader__items'),
        tabContent = document.querySelectorAll('.tabcontent');

    function hideTabContent () {
        tabContent.forEach((item) => {
            item.classList.add('hide');
            item.classList.remove('fade', 'show');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
    }
    function showTabContent (i = 0) {
        tabContent[i].classList.add('fade', 'show');
        tabContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabParent.addEventListener('click', function(event) {
        const target = event.target;

        if(target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i ) => {
                if(item == target){
                    hideTabContent();
                    showTabContent(i);
                }
            });

        }
    });

    //Timer

    const deadLine = '2021-06-20' ;

    function getTimeRemaning(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
              days = Math.floor(t / (1000 * 60 * 60 * 24)),
              hours = Math.floor(t / (1000 * 60 * 60) % 24),
              minutes = Math.floor(t / (1000 / 60) % 60),
              seconds = Math.floor(t / (1000) % 60);

        return {
            t,
            days,
            hours,
            minutes,
            seconds
        };
    }

    function getZero(num) {
        if(num >= 0 && num < 10) {
            return `0${num}`;
        }
        else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
              days = timer.querySelector('#days'),
              hours = timer.querySelector('#hours'),
              minutes = timer.querySelector('#minutes'),
              seconds = timer.querySelector('#seconds'),
              timeInterval = setInterval(updateClock, 1000);

              updateClock();

              function updateClock() {
                  const t = getTimeRemaning(endtime);

                  days.innerHTML = getZero(t.days);
                  hours.innerHTML = getZero(t.hours);
                  minutes.innerHTML = getZero(t.minutes);
                  seconds.innerHTML = getZero(t.seconds);

                  if(t.total <= 10) {
                      clearInterval(timeInterval);
                  }
              }
            
    }                                                                                                       
    setClock('.timer', deadLine);

//Modal

    const btnOpen = document.querySelectorAll('[data-modal]'),
          modal = document.querySelector('.modal');



    function showModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimerId);
    }
    
    btnOpen.forEach((item) => {
        item.addEventListener('click', showModal);
    });

    function hideModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    modal.addEventListener('click', (e) => {
        const target = e.target;

        if(target === modal || target.getAttribute('data-close') == '') {
            hideModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if(e.code === 'Escape' && modal.classList.contains('show')) {
            hideModal();
        }
    });

    const modalTimerId = setTimeout(showModal, 30000);

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            showModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }            
    window.addEventListener('scroll', showModalByScroll);

    //Menucard

    class MenuCard{
        constructor(src, alt, title, dscr, price, parentSelector, ...classes ) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.dscr = dscr;
            this.price = price;
            this.parent = document.querySelector(parentSelector);
            this.classes = classes;
            this.transfer = 28;
            this.transToUAH();
        }

        transToUAH() {
            this.price = this.transfer * this.price;
        }

        render() {
            const div = document.createElement('div');
            if(this.classes.length === 0) {
                this.classes = 'menu__item';
                div.classList.add(this.classes);
            } else {
                this.classes.forEach(className => div.classList.add(className))
            }
            div.innerHTML = `
                    <img src=${this.src} alt=${this.alt}">
                    <h3 class="menu__item-subtitle">${this.title}</h3>
                    <div class="menu__item-descr">${this.dscr}</div>
                    <div class="menu__item-divider"></div>
                    <div class="menu__item-price">
                        <div class="menu__item-cost">Цена:</div>
                        <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                    </div>
            `;
            this.parent.append(div);
        }
        
    }

    const getResource = async (url, data) => {
        const res = await fetch(url);

        if(!res.ok){
            throw new Error(`Could not fetch ${url}, error number: ${res.status}`);
        }

        return await res.json();
    };

    // getResource('http://localhost:3000/menu')
    // .then(data => {
        // data.forEach(({img, altimg, title, descr, price}) => {
        //     new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
        // });
    // });

    axios.get('http://localhost:3000/menu')
    .then(data => {
        data.data.forEach(({img, altimg, title, descr, price}) => {
            new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
        });
    });

    //form

    const forms = document.querySelectorAll('form');

    const message = {
        loaded: 'img/form/spinner.svg',
        error: 'error',
        success: 'thank you, we will call you soon'
    };

    forms.forEach(item => bindPostData(item));

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        });
        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let statusMessage = document.createElement('img');
            statusMessage.src = message.loaded;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement('afterend', statusMessage);
    

            const formData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData('http://localhost:3000/requests', json)
                .then(data => {
                console.log(data);
                showThanksModal(message.success);
                statusMessage.remove();
            })
            .catch(() => {
                showThanksModal(message.error);
            })
            .finally(() => {
                form.reset();
            });

        });
    } 

    function showThanksModal(message) {
        const prevModal = document.querySelector('.modal__dialog');

        prevModal.classList.add('hide');
        showModal();

        const thanksMessage = document.createElement('div');
        thanksMessage.classList.add('modal__dialog');
        thanksMessage.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>×</div>
                <div class="modal__title">${message}</div>
            </div>
        `;

        document.querySelector('.modal').append(thanksMessage);

        setTimeout(() => {
            thanksMessage.remove();
            prevModal.classList.add('show');
            prevModal.classList.remove('hide');
            hideModal();
        }, 4000);
    }

//slides
    let slideIndex = 1;
    let offset = 0;
    const slides = document.querySelectorAll('.offer__slide'),
          slider = document.querySelector('.offer__slider'),
          prev = document.querySelector('.offer__slider-prev'),
          next = document.querySelector('.offer__slider-next'),
          total = document.querySelector('#total'),
          current = document.querySelector('#current'),
          slidesWrapper = document.querySelector('.offer__slider-wrapper'),
          slidesField = document.querySelector('.offer__slider-inner'),
          width = window.getComputedStyle(slidesWrapper).width;
          
        if(slides.length < 10){
            total.textContent = `0${slides.length}`;
            current.textContent = `0${slideIndex}`;
        }else{
            total.textContent = slides.length;
            current.textContent = slideIndex;
        }

          slidesField.style.width = 100 * slides.length + '%';
          slidesField.style.display = 'flex';
          slidesField.style.transition = '0.5s all';

          slidesWrapper.style.overflow = 'hidden';

          slides.forEach(slide => {
            slide.style.width = width;
          });

          slider.style.position = 'relative';

          const indecators = document.createElement('ol'),
                dots = [];
          indecators.classList.add('carousel-indicators');
          indecators.style.cssText = `
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 15;
            display: flex;
            justify-content: center;
            margin-right: 15%;
            margin-left: 15%;
            list-style: none;
          `;
          slider.append(indecators);

          for(let i = 0; i < slides.length; i++){
              const dot = document.createElement('li');
              dot.setAttribute('data-slide-to', i + 1);
              dot.style.cssText = `
                box-sizing: content-box;
                flex: 0 1 auto;
                width: 30px;
                height: 6px;
                margin-right: 3px;
                margin-left: 3px;
                cursor: pointer;
                background-color: #fff;
                background-clip: padding-box;
                border-top: 10px solid transparent;
                border-bottom: 10px solid transparent;
                opacity: .5;
                transition: opacity .6s ease;
              `;
            if(i == 0){
                dot.style.opacity = 1;
            }

            indecators.append(dot);
            dots.push(dot);
          }

          next.addEventListener('click', () => {
              if(offset == +width.slice(0, width.length - 2) * (slides.length - 1)) {
                  offset = 0;
              } else {
                  offset += +width.slice(0, width.length - 2);
              }

              slidesField.style.transform = `translateX(-${offset}px)`;

              if(slideIndex == slides.length){
                  slideIndex = 1;
              } else {
                  slideIndex++;
              }

              if(slides.length < 10){
                  current.textContent = `0${slideIndex}`;
              }else{
                  current.textContent = slideIndex;
              }

              dots.forEach(dot => dot.style.opacity = '.5');
              dots[slideIndex - 1].style.opacity = '1';
          });

          prev.addEventListener('click', () => {
            if(offset == 0) {
                offset = +width.slice(0, width.length - 2) * (slides.length - 1);
            } else {
                offset -= +width.slice(0, width.length - 2);
            }

            slidesField.style.transform = `translateX(-${offset}px)`;

            if(slideIndex == 1){
                slideIndex = slides.length;
            } else {
                slideIndex--;
            }

            if(slides.length < 10){
                current.textContent = `0${slideIndex}`;
            }else{
                current.textContent = slideIndex;
            }
            dots.forEach(dot => dot.style.opacity = '.5');
            dots[slideIndex - 1].style.opacity = '1';
        });

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideTo = e.target.getAttribute('data-slide-to');
    
                slideIndex = slideTo;
                offset = +width.slice(0, width.length - 2) * (slideTo - 1);
    
                slidesField.style.transform = `translateX(-${offset}px)`;
    
                if (slides.length < 10) {
                    current.textContent =  `0${slideIndex}`;
                } else {
                    current.textContent =  slideIndex;
                }
    
                dots.forEach(dot => dot.style.opacity = ".5");
                dots[slideIndex-1].style.opacity = 1;
            });
        });
    // showSlides(slideIndex);

    // if(slides.length < 10){
    //     total.textContent = `0${slides.length}`;
    // }else{
    //     total.textContent = slides.length;
    // }



    // function showSlides (n) {
    //     if(n > slides.length) {
    //         slideIndex = 1;
    //     }

    //     if(n < 1) {
    //         slideIndex = slides.length;
    //     }

    //     slides.forEach(item => item.style.display = 'none');

    //     slides[slideIndex - 1].style.display = 'block';



        // if(slides.length < 10){
        //     current.textContent = `0${slideIndex}`;
        // }else{
        //     current.textContent = slideIndex;
        // }
    // }

    // function showPlus(n) {
    //     showSlides(slideIndex += n);
    // }

    // prev.addEventListener('click', () => {
    //     showPlus(-1);
    // });

    // next.addEventListener('click', () => {
    //     showPlus(1);
    // });
 
});