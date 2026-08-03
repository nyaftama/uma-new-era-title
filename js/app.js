document.addEventListener('DOMContentLoaded', () => {
    // Canvas & State (Fixed 16:9 ratio: 1067x600)
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');

    const CANVAS_WIDTH = 1067;
    const CANVAS_HEIGHT = 600;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const state = {
        bgImage: null,
        imgRotation: 0, // 0, 90, 180, 270 degrees
        textLine1: '東京優駿',
        textLine2: '',
        // Line 2 detail fields
        detailCourse: '東京',
        detailFieldType: '芝',
        detailDirection: '左',
        detailDist: '2400m',
        detailWeather: '曇',
        detailCondition: '重',

        isCanvasLocked: false,
        textSizeLine1: 188, // Line 1 font size default: 188px
        textSizeLine2: 40,  // Line 2 font size default: 40px
        showLetterbox: true, // CinemaScope black bars default ON

        posX: 50, // percentage 0 - 100
        posY: 50, // default 50%
        imgX: 0,  // percentage offset
        imgY: 0,  // percentage offset
        imgScale: 100, // percentage
        showBrighten: false, // Image brightness boost default OFF
        imgBrightness: 130,  // Brightness value default 130%
        dragTarget: 'image', // default 'image'
        isDragging: false,
        dragStart: { x: 0, y: 0 }
    };

    // DOM Elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const pasteImgBtn = document.getElementById('pasteImgBtn');
    const rotateImgLeftBtn = document.getElementById('rotateImgLeftBtn');
    const rotateImgRightBtn = document.getElementById('rotateImgRightBtn');
    const resetImgBtn = document.getElementById('resetImgBtn');

    // Inputs Line 1 with Autocomplete
    const textLine1Input = document.getElementById('textLine1');
    const clearRaceInputBtn = document.getElementById('clearRaceInputBtn');
    const raceSuggestionsBox = document.getElementById('raceSuggestionsBox');
    const textLine1Error = document.getElementById('textLine1Error');

    // Detail Selects & Custom Inputs (6 items)
    const courseSelect = document.getElementById('courseSelect');
    const courseInput = document.getElementById('courseInput');
    const fieldTypeSelect = document.getElementById('fieldTypeSelect');
    const fieldTypeInput = document.getElementById('fieldTypeInput');
    const directionSelect = document.getElementById('directionSelect');
    const directionInput = document.getElementById('directionInput');
    const distSelect = document.getElementById('distSelect');
    const distInput = document.getElementById('distInput');
    const weatherSelect = document.getElementById('weatherSelect');
    const weatherInput = document.getElementById('weatherInput');
    const conditionSelect = document.getElementById('conditionSelect');
    const conditionInput = document.getElementById('conditionInput');

    const presetChips = document.querySelectorAll('.preset-chip');
    const presetsWrapper = document.querySelector('.presets-wrapper');
    let presetsDisableTimeout = null;

    function setPresetsDisabled(disabled) {
        if (!presetsWrapper) return;
        if (presetsDisableTimeout) {
            clearTimeout(presetsDisableTimeout);
            presetsDisableTimeout = null;
        }

        if (disabled) {
            presetsWrapper.classList.add('disabled');
        } else {
            presetsDisableTimeout = setTimeout(() => {
                presetsWrapper.classList.remove('disabled');
            }, 250);
        }
    }
    const redrawBtn = document.getElementById('redrawBtn');

    const canvasLockCheckbox = document.getElementById('canvasLockCheckbox');
    const canvasLockToggle = document.getElementById('canvasLockToggle');
    const canvasCard = document.querySelector('.canvas-card');

    const textSizeLine1Input = document.getElementById('textSizeLine1');
    const textSizeLine1Val = document.getElementById('textSizeLine1Val');
    const textSizeLine2Input = document.getElementById('textSizeLine2');
    const textSizeLine2Val = document.getElementById('textSizeLine2Val');
    const posYInput = document.getElementById('posY');
    const posYVal = document.getElementById('posYVal');
    const posXInput = document.getElementById('posX');
    const posXVal = document.getElementById('posXVal');
    const imgScaleInput = document.getElementById('imgScale');
    const imgScaleVal = document.getElementById('imgScaleVal');
    const letterboxCheckbox = document.getElementById('letterboxCheckbox');
    const brightenCheckbox = document.getElementById('brightenCheckbox');
    const brightenToggle = document.getElementById('brightenToggle');
    const imgBrightnessInput = document.getElementById('imgBrightness');
    const imgBrightnessVal = document.getElementById('imgBrightnessVal');
    const imgBrightnessWrapper = document.getElementById('imgBrightnessWrapper');
    const dragTargetRadios = document.querySelectorAll('input[name="dragTarget"]');

    const resetBtn = document.getElementById('resetBtn');
    const generateBtn = document.getElementById('generateBtn');
    const generateGifBtn = document.getElementById('generateGifBtn');

    // Modal
    const shareModal = document.getElementById('shareModal');
    const shareStep1 = document.getElementById('shareStep1');
    const shareImagePreview = document.getElementById('shareImagePreview');
    const downloadModalBtn = document.getElementById('downloadModalBtn');
    const twitterShareBtn = document.getElementById('twitterShareBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const copyImageBtn = document.getElementById('copyImageBtn');

    // GIF Modal step elements
    const shareStepGif = document.getElementById('shareStepGif');
    const gifModalTitle = document.getElementById('gifModalTitle');
    const gifLoadingState = document.getElementById('gifLoadingState');
    const gifResultState = document.getElementById('gifResultState');
    const gifPreview = document.getElementById('gifPreview');
    const gifSeekbarFill = document.getElementById('gifSeekbarFill');
    const gifCurrentTime = document.getElementById('gifCurrentTime');
    const gifTwitterShareBtn = document.getElementById('gifTwitterShareBtn');
    const downloadGifBtn = document.getElementById('downloadGifBtn');
    const closeGifModalBtn = document.getElementById('closeGifModalBtn');

    let currentGifBlobUrl = null;

    // NG Words Filter State & Encoded Fallback
    let ngWords = [];
    let isNgWordDetected = false;

    const FALLBACK_NG_WORDS_B64 = "TlhFeU4wTjFZWFYxWjNKcVp6VkVhbWMxUkdwbmNVbExOVXh4U1RWaU5rMDFUR2xPTmtsdGRrTjFZVUZ4ZFdGSmExRnlhM1ZKZG0xcFdYTkxORFJMYVRRMFQzbzBORTlDUTNWdGJtaFBiVzF5UVhKc2FHRjJibTFpTjNCc1ltTkxObUZsUlRWTU1tTkRkVTlEY1hWUFJISXJUME56SzA5RWMzZHlibWR2TjJ0MVNXOUxOV0UyZWpWdlMzRkRkV1Y1YkN0WFZHZFJjbXBuY2xScVp6VTRTelEwUzNZME5FczVRM1ZQUW1vclQwSnVVWEpzY25KTlN6Wk1SMkZEZFU5RGNtVlBSRzluY25CdE5VaHdjbHB2U3pRMFQxazBORXRyTkRSUFNVTjFZVnByWjNKcVozRnFhbWMyTUVzME5FdHZORFJQUkRRMFQwSkRkV0ZCY0hkeWFtZHlkbXBuTkZCcVozRXZhbWR5YTBzME5FZG9ORFJMVkRRMFIxUkRkVTlDYjJWUFEyc3JUMEp2WlU5RGEzZHlhbWRpTjJwbmNGQnFaMXBOU3pRMFIwczBORWRxTkRSSGVEUTBSMFZEZFZjemNVOVROWE4zY210MVlrMUxOV0pETjBOMVQwUnNaVTlEY0N0UFJIRlJjbTFwV1hacVozSlFhbWR4TUVzMWNIbHpOVFZYY1VOMWJXbHhUMU12YkhkeWEzVkxNMnhvTjNKcVoxcGpTelZ5TW5VMVdrTTFORFJIVGtOMVpYbDJkV0V5YzJkeWJuTnlOMnh5V2tGTE5EUkxjVFEwVDBzME5FOU1ORFJQT0VOMWFVaHhkV0ZHYzBGeWJtcExXRzl3VEhOTE5EUkxVRFEwUjBVME5FZGlORFJIYTBOMVYwaHdkVmRzYzNkeWJuRTJXRzl6Y0RSTFVWWlpTelEwVDNNME5FdHJORFJQV0VOMVlUTnhLMU0xYzFGeWJHODNURzF0UzFWTE5reExNelZ3YVd4RGFtZDRUVUZ2ZUUxVVVURk5WRkZMVFZScmVFOVJjbkJvTkRkdWFtRk5TelZ5WlhJMVlWTnBRM1ZYUm1sUGFUaHhVWEp1YkV4RWJXbFpRVXMyV1Vkbk5sbGxUME4xVDBOd1QwOUVjeXRQUkc5QmNtcG5ObFJxWjNKcWFtYzJXR3BuY1ZsTE5EUkxOelEwVDNvME5FOVNORFJMYTBOMVQwTjJLMDlFYVdWUFEzTXJUMFJ5VVhKcVp6UnFhbWR4Y21wbk5EUkxORFJMYXpRMFMzUTBORXM1TkRSTGJVTjFUMFJ4VDA5RGRFOVBSR3hsVDBSeGRVOUVjQ3RQUTNCbmNtcG5ObFJxWjNGeWFtYzBTR3BuTm1acVozRlpTelEwUzNRME5FOXVORFJQVERRMFQydzBORXR0UTNWUFJHaDFUME56SzA5RGNsRnlhbWMxZG1wbk4xQnFaelZFYW1jM1RVczBORTlXTkRSTGJUUTBTeXMwTkV0MlEzVlBSR2wxVDBOeEswOUVaMDlQUTNSM2NtcG5jbVpxWjNGeWFtYzFXR3BuY1RCTE5EUkxOelEwUzJzME5FdHZORFJMZEVOMVQwTjFLMDlEY0U5UFEzUjNjbXBuY21acVp6Wm1hbWR5YW1wbk5tTkxORFJQU2pRMFMyMDBORTlITkRSTGEwTjFUMEpvVDA5RGF5dFBRMmRCY21wbmIxUnFaMXBxYW1kdldHcG5XVmxMTkRSSFlqUTBTMVEwTkVkNE5EUkhSVU4xVDBKdUswOUNjV1ZQUW1zclQwTnFVWEpxWjJGcWFtZFpjbXBuWVRSTE5EUkhSVFEwUjA0ME5FZGtORFJIUjBOMVQwTnBUMDlDYkU5UFFuUmxUME5wZFU5RGFDdFBRbWhuY21wbmIxUnFaMWx5YW1kaFNHcG5iMlpxWjFsWlN6UTBSMDQwTkV0SU5EUkhjalEwUzBZME5FZEhRM1ZQUW5CMVQwSnJLMDlDYWxGeWFtZGlkbXBuY0ZCcVoySkVhbWR3VFVzME5FY3hORFJIUnpRMFIyVTBORWRRUTNWUFFuRjFUMEpwSzA5Q2IwOVBRbXgzY21wbldtWnFaMWx5YW1kaVdHcG5XVEJMTkRSSFlqUTBSMFUwTkVkSk5EUkhUa04xVDBKdEswOUNhRTlQUW14M2NtcG5XbVpxWjI5bWFtZGFhbXBuYjJOTE5EUkhjRFEwUjBjME5FZHRORFJIUlVOdFdqRlpNbk5MV201V2FtRXliSFZhZDNCdFpGZE9jbHBZU1V0ak1taHdaRUZ3YVdGWVVtcGhRWEI2WWtoV01FTnVaRzlpTTBwc1EyMUthR016VW1oamJWRkxXVmhPZW1GSE9YTmFVWEJxWkZjMU1FTnRVbkJaTW5OTFkwaFdlbU16YTB0Wk1qbHFZWGR3ZDFwWE5YQmpkM0F5V1Zka2NHSnRSVXRaYlRsMldXNU5TMkpYYkhOYVozQnJZVmQ0YTJKM2NIZGlNMHAxUTI1Q2RtTnROWFpEYldoc1ltNVNhR0ZSY0hwYVdHZExZekpXTkdWUmNIVmtWMUpzUTIwMWFHRXlWbXREYlVaMVdWZDNTMkl6U201WldFNTBRMjFPTVdKUmNIUlpXRTR3WkZoS2FWbFlVbXhEYlZaNVlqTlNjRmwzY0hKaFYzaHpRMjB4TVdOdFVteGpaM0I2WkZkc2FtRlhVbXhEYlZKc1dWaFNiME51VW14amJrcDJZMjFzZW1SQmNIVlpXSEJ3UTIwMWNGb3laR3hqWjNCMVlWZGtibGxSY0cxWlYyUnVZak5SUzJOdFZqQlpXRXByUTNWUFEyOTFUMFJwZFU5RWNYZHlhbWRaVEdwbllYSnFaMjl6U3pRMFMyazBORTlMTkRSUFREUTBUemhEZFU5Q1ozVlBRbkYxVDBKeEswOUVka0Z5YW1jMWNtcG5OSFpxWjNKclN6UTBSelkwTkVkeU5EUkhXa04xVDBSMFQwOURiMlZQUTNKMVQwUnBaM0pxWnpWRWFtZHhOMnBuTkc5TE5EUkhkelEwUjA4ME5FZHhRM1ZQUTNJclQwUnhkVTlFYVU5UFJIRjFUME4xVVhKcVoxa3ZhbWR2Y21wbllXcHFaMjl5YW1kYWEwczBORWRvTkRSTFZEUTBSemxEZFU5Q2IyVlBRMnNyVDBKMlpVOUNhM2R5YW1jMFNHcG5OMUJxWnpVd1N6UTBUMEkwTkU5Nk5EUlBaRFEwUzNwRGRVOUVaM1ZQUkhNclQwUnVVWEpxWjFseWFtZGlOMnBuY0ZCcVoxcE5TelEwUzNFME5FOWxORFJQZWpRMFMzcERkVTlFYm5WUFJITXJUMFJ1VVhKcVoxbHlhbWRoU0dwbmNGQnFaMkZJYW1kd1RVczBORXR4TkRSUFFqUTBUM28wTkU5Q05EUlBla04xYlZwelQyMUVjVUZ5YW1kWlZHcG5jRkJxWjJKWlN6VnZRMjQxV20xdlEzVlBRbTByVDBKb1QwOUNhbEZ5YW1jMVNHcG5jVlJxWnpWSWFtYzNUVXMwTkVkNE5EUkhSVFEwUjNnME5FdFVRM1ZsTUc5UGFVTnZVWEpxWjFwdWFtZGlOMnBuV2poTE5EUkxOVFEwVDJVME5Fc3ZRM1ZQUkhKbFQwUjJUMDlEZGl0UFJIWkJjbXBuYnpOcVp6ZDZhbWRhTDJwbk4zZExOV0pEUlRVM1N5dERkVTlDYkN0UFEyY3JUMEp0SzA5Q2FFRnlibTFpY20xbk5GVkxORFJIZGpRMFIyczBORWRaTkRSTFNEUTBSMGREZFZkcmFXVmhSbWwzY21wblltcHFaM0JRYW1kYUwycG5XVkZMTkRSUGREUTBUM0ZEZFU5RGRDdFBSSEFyVDBOMmQzSnFaMjh6YW1kdmIwczBORWRZTkRSTFNEUTBSMlpEZFcxamMzVlhTSFZuY21wbmJ6TnFaMXBtYW1kdldHcG5ZVkZMTlZreWVqVmlRelpEZFU5Q2JtVlBRbW9yVDBKc0swOURaeXRQUW1wM2NtcG5jVlJxWnpadWFtYzFOMnBuTkVocVozRnZTelEwUjBVME5FdEtORFJIS3pRMFIyZzBORWRMUTNWUFEzQlBUMFJ4WlU5RWJtZHlhbWMxU0dwbmNWUnFaM0p5YW1jMmIwczBORWQ0TkRSSFJUUTBSMkUwTkV0TFEzVlBRM0lyVDBSekswOUVhWGR5YW1kWkwycG5jRkJxWjJGelN6UTBUMGcwTkV0cU5EUlBPRFEwVDFnME5FczFORFJQZERRMFR6ZzBORTlKUTNWUFFuQXJUMEpuSzA5RWRrOVBRblFyVDBKdFpVOURhbVZQUkhaUFQwSnhRWEpxWjNKMmFtZHhMMnBuTmpOcVozSnJTelEwUjJJME5FZFFORFJMVGpRMFIxcERkVTlEZEN0UFEzTXJUME4wSzA5RGMzZHlhbWRhWm1wbldsQnFaMXBtYW1kYVRVczBORXN6TkRSTGVqUTBTMHREZFU5Q2JDdFBRbXNyVDBOcFozSnFaMkppYW1kaFVHcG5XWFpxWjFwRlN6UTBUMWMwTkU5RU5EUkxjalEwUzNoRGRXVnZjblZUTjIxUFQwSnJVWEpxWjFvdmFtZGhNMnBuWVZScVoxcEZTelEwUzNFME5FOUxORFJQWVRRMFQwUTBORTlKUTNWUFFtbDFUMEp4ZFU5Q2RYVlBRbThyVDBKeFFYSnFaM0pRYW1jM1VHcG5ORzVxWnpkNmFtYzJRVXMwTkVkVU5EUkxWRFEwUjNBME5FODRORFJMUVVOMVQwUnZaVTlEZFdWUFEzSlBUME55VVhKcVoyOUlhbWRhYm1wbldYcHFaMWt3U3pVMVpUQTFjbmxwUTNWUFFtOWxUMEpwSzA5RGEzZHlhbWMwU0dwbmNYWnFaemROU3pVMWRWZzFjRXQxUTNWUFFuRlBUMEpvZFU5Q2JHVlBRbkJCY214eGNISnZiSEYzU3pRMFIzbzBORXRGTkRSSFVFTjFiVnAwWldrcmMxRnlhbWR2Y21wbmIyWnFaMWxpYW1kYWFtcG5iMlpxWjFrNFN6WkxjUzgxY0ZkYVEzVlBRbTlsVDBOb0swOUNhSFZQUW1wbFQwTm9LMDlDYUdkeWJIQmlWSEJ0Y21OTE5EUkhjRFEwUzAwME5FZEZRM1ZsTTJsMVpUUnRkM0pxWjFremFtZHdVR3BuWWtScVoxazRTelpNSzFJMlMyRnhOVFYxTkRWaFpXMURkVTlDYW1WUFEyc3JUMEpzSzA5RGF5dFBRbTVsVDBKb2RVOUNhU3RQUTJ0M2NtcG5ZbGhxWjFsbWFtZHZhMHMxYjIxTU5EUlBaVFEwVDNwRGRVOUNjSFZQUW5aMVQwTnJkM0pxWnpSaWFtYzFOMnBuTjAxTE5XOTVTRFEwVDJVME5FOTZRM1ZQUTJoMVQwSnpLMDlDZG5WUFEydDNjbXBuTm1KcVp6VlFhbWMxTjJwbk4wMUxORFJMYlRRMFQyVTBORXN6TkRSTGVrTjFUMEpvZFU5Q2RuVlBRbXdyVDBKcmQzQXhZbGhPY2tOMVpYbDJkV1ZzYm5WdFlXNVBWM1Z6ZDNKcVozSjJhbWR4VkdwbmNtWnFaemRRYW1keVptcG5ObVpxWjNGaWFtZHhlbXBuY1ZGTE5EUkhZalEwUjBVME5FZFlORFJMVkRRMFIxZzBORXRJTkRSSFJ6UTBSMDAwTkVkRlEzVmxlWFoxWld4dWRXVllhRkZ5YW1keWRtcG5jVlJxWjNKbWFtYzNVR3BuTlZCcVp6Wm1hbWR4V1VzME5FZGlORFJIUlRRMFIxZzBORXRVTkRSSGVqUTBTMGcwTkVkSFEzVmxlWFoxWld4dWRXVlhkblZoUTI5M2NtcG5jblpxWjNGVWFtZHlabXBuTjFCcVozSm1hbWMwVUdwbmNYWnFaemROU3pRMFIySTBORWRGTkRSSFdEUTBTMVEwTkVkWU5EUkhhalEwUjB3ME5FdFVRM1ZsWm5CbFpXRm9UMjFoYms5WGRYTjNjbXBuTkVocVp6UmlhbWR4TTJwbmNtWnFaelptYW1keFltcG5jWHBxWjNGUlN6UTBSMmcwTkVkdE5EUkhUalEwUjFnME5FdElORFJIUnpRMFIwMDBORWRGUTNWbFpuQmxiV0Z1UVhKcVp6UklhbWR5Wm1wbk5tWnFaM0ZaU3pRMFIyZzBORWRZTkRSTFNEUTBSMGREZFdWYWRYVnRRbXhQYldGdVQxZDFjM2R5YW1jMEwycG5ORkJxWjNJdmFtYzBWR3BuY21acVp6Wm1hbWR4WW1wbmNYcHFaM0ZSU3pRMFIzWTBORWRxTkRSSFpqUTBSMnMwTkVkWU5EUkxTRFEwUjBjME5FZE5ORFJIUlVOMWFUWnhLMU01YXl0dFlXNVBWM1Z6ZDNKcVozSm1hbWMzVUdwbmNpOXFaM0ZVYW1keVptcG5ObVpxWjNGaWFtZHhlbXBuY1ZGTE5EUkhXRFEwUzFRME5FZG1ORFJIUlRRMFIxZzBORXRJTkRSSFJ6UTBSMDAwTkVkRlEzVnBObkVyYldGdVFYSnFaM0ptYW1jM1VHcG5jbVpxWnpabWFtZHhXVXMxTjFkNE5WcERTVFZoVTNnMlMzRXZRM1ZQUkdsUFQwTndkVTlEZEU5UFEzQjFUME4wSzA5RVp5dFBSR2RsVDBSd0swOURjR2R5YW1kaGFtcG5XV0pxWjFwVWFtZFpZbXBuV21acVoyRlFhbWRoU0dwbmIyWnFaMWxaU3pVM1N5czFObGRsTlZscFJ6WkxUME5EZFU5RGRTdFBRM0JQVDBOMEswOUVjeXRQUkd4MVQwUnpLMDlFY2s5UFJHaEJjbXBuV25acVoxbFVhbWRhWm1wbmNGQnFaMkppYW1kd1VHcG5iM3BxWjJGUlN6Wk1jVUkyWVhsNFEzVnBObWRsVDBKb2RVOUNjRUZ5YW1keU0ycG5jV0pxWjNGaWFtYzBVVXMwTkVka05EUkhSelEwUjBjME5FZHJRM1ZUTm5WMVlXZDJUMjFoYms5WGRYTjNjbXBuY21wcVp6ZFFhbWR4ZG1wbmNTOXFaM0ptYW1jMlptcG5jV0pxWjNGNmFtZHhVVXMwTkVkWk5EUkxWRFEwUjB3ME5FZFFORFJIV0RRMFMwZzBORWRITkRSSFRUUTBSMFZEZFcxaGJrOVhkWE1yYVVGb1VYSnFaM0ptYW1jMlptcG5jV0pxWjNGNmFtZHhWR3BuY21acVp6Wk5TelEwUjFnME5FdElORFJIUnpRMFIwMDBORWRGTkRSSFdEUTBTMFJEZFdseGFtVmxabkJsWlZob2QzSnFaelIyYW1jM1VHcG5ORWhxWjNKbWFtYzJabXBuY1ZsTE5EUkhjalEwUzFRME5FZG9ORFJIV0RRMFMwZzBORWRIUTNWbFdIUlBWMUpvWjNKcVp6UklhbWMxZG1wbmNWbExORFJIYURRMFJ6YzBORWRIUTNWbFRHZDFVeloxWjNKcVozRXphbWMyWm1wbmNXSnFaM0pxYW1jM1RVczBORWRPTkRSTFNEUTBSMGMwTkVkWk5EUkxWRU4xWVhkc0syMUNiR1ZQUW1oQmNtMXpTbVp1YVRSTWFtZFpVVXMxV2lzMk5WcDVkelZoVTFkRGRVOURjbVZQUkdkbFQwTnlUMDlEY0VGeWFtZFpNMnBuWVVocVoxbDZhbWRaVVVzME5FdHpORFJMYXpRMFN6UkRkVTlDYWs5UFFtaFBUMEp0UVhKdGMyRkViWE55ZDBzME5FdHlORFJMTHpRMFQzWkRkVTlDYVN0UFFtNHJUME5xZHowOQ==";

    function decodeTripleBase64(b64Str) {
        try {
            const cleanStr = String(b64Str).replace(/\s+/g, '');
            const pass1 = atob(cleanStr).replace(/\s+/g, '');
            const pass2 = atob(pass1).replace(/\s+/g, '');
            const pass3Binary = atob(pass2);
            const bytes = new Uint8Array(pass3Binary.length);
            for (let j = 0; j < pass3Binary.length; j++) {
                bytes[j] = pass3Binary.charCodeAt(j);
            }
            return new TextDecoder('utf-8').decode(bytes);
        } catch (e) {
            console.warn('Failed to decode Base64:', e);
            return '';
        }
    }

    async function loadNgWords() {
        let loadedText = '';
        try {
            const versionBadge = document.querySelector('.version-badge');
            const version = versionBadge ? versionBadge.textContent.trim().replace(/^v/, '') : '';
            const fetchUrl = version ? `data/ng_words.txt?v=${version}` : 'data/ng_words.txt';
            const response = await fetch(fetchUrl);
            if (response.ok) {
                const rawText = await response.text();
                loadedText = decodeTripleBase64(rawText);
            }
        } catch (err) {
            console.warn('Could not fetch ng_words.txt:', err);
        }

        if (!loadedText) {
            loadedText = decodeTripleBase64(FALLBACK_NG_WORDS_B64);
        }

        if (loadedText) {
            ngWords = loadedText
                .split(/\r?\n/)
                .map(w => w.trim())
                .filter(w => w.length > 0 && !w.includes('\uFFFD') && /^[\u3040-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF\w]+$/u.test(w));
        }

        validateAllInputs();
    }

    function normalizeText(str) {
        if (!str) return '';
        let normalized = str.normalize('NFKC').toLowerCase();
        return normalized.replace(/[\u30a1-\u30f6]/g, (ch) => {
            return String.fromCharCode(ch.charCodeAt(0) - 0x60);
        });
    }

    function hasEmoji(str) {
        if (!str) return false;
        try {
            if (/\p{Extended_Pictographic}/u.test(str)) {
                return true;
            }
        } catch (e) { }

        const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}]/u;
        return emojiRegex.test(str);
    }

    function checkTextError(text, ignoreObstacleWord = (fieldTypeSelect && fieldTypeSelect.value === '障害')) {
        if (!text || text.trim().length === 0) return { error: false, type: null };
        if (hasEmoji(text)) return { error: true, type: 'emoji' };
        if (ngWords.length > 0) {
            const normalizedText = normalizeText(text);
            for (const word of ngWords) {
                const normalizedWord = normalizeText(word);
                // コースで「障害」が選択されている場合は「障害」「害」という単体のNG判定のみ無効化
                if (ignoreObstacleWord && (normalizedWord === '障害' || normalizedWord === '害')) {
                    continue;
                }
                if (normalizedWord && normalizedText.includes(normalizedWord)) {
                    return { error: true, type: 'ng' };
                }
            }
        }
        return { error: false, type: null };
    }

    function validateAllInputs() {
        const isObstacleMode = fieldTypeSelect && fieldTypeSelect.value === '障害';

        const line1Result = checkTextError(state.textLine1);
        const line2Result = isObstacleMode ? { error: false, type: null } : checkTextError(state.textLine2);

        let isCourseError = false;
        if (courseSelect && courseSelect.value === 'custom') {
            const courseVal = courseInput ? courseInput.value : '';
            const courseCheck = checkTextError(courseVal);
            if (courseCheck.error || courseVal.length > 10) {
                isCourseError = true;
                if (courseInput) courseInput.classList.add('input-error');
                if (courseCharHint) {
                    courseCharHint.classList.add('hint-error');
                    courseCharHint.textContent = courseVal.length > 10 ? '10文字まで（文字数超過）' : '10文字まで';
                }
            } else {
                if (courseInput) courseInput.classList.remove('input-error');
                if (courseCharHint) {
                    courseCharHint.classList.remove('hint-error');
                    courseCharHint.textContent = '10文字まで';
                }
            }
        } else {
            if (courseInput) courseInput.classList.remove('input-error');
            if (courseCharHint) {
                courseCharHint.classList.remove('hint-error');
                courseCharHint.textContent = '10文字まで';
            }
        }

        let isFieldTypeError = false;
        if (fieldTypeSelect && fieldTypeSelect.value === 'custom') {
            const fieldTypeVal = fieldTypeInput ? fieldTypeInput.value : '';
            const fieldTypeCheck = checkTextError(fieldTypeVal);
            if (fieldTypeCheck.error || fieldTypeVal.length > 10) {
                isFieldTypeError = true;
                if (fieldTypeInput) fieldTypeInput.classList.add('input-error');
                if (fieldTypeCharHint) {
                    fieldTypeCharHint.classList.add('hint-error');
                    fieldTypeCharHint.textContent = fieldTypeVal.length > 10 ? '10文字まで（文字数超過）' : '10文字まで';
                }
            } else {
                if (fieldTypeInput) fieldTypeInput.classList.remove('input-error');
                if (fieldTypeCharHint) {
                    fieldTypeCharHint.classList.remove('hint-error');
                    fieldTypeCharHint.textContent = '10文字まで';
                }
            }
        } else {
            if (fieldTypeInput) fieldTypeInput.classList.remove('input-error');
            if (fieldTypeCharHint) {
                fieldTypeCharHint.classList.remove('hint-error');
                fieldTypeCharHint.textContent = '10文字まで';
            }
        }

        let isDistError = false;
        if (!isObstacleMode) {
            const distCheck = checkTextError(state.detailDist);
            if (distCheck.error) {
                isDistError = true;
            }
        }
        if (distSelect && distSelect.value === 'custom') {
            const distVal = distInput ? distInput.value : '';
            const customDistCheck = isObstacleMode ? { error: false, type: null } : checkTextError(distVal);
            if (customDistCheck.error || distVal.length > 10) {
                isDistError = true;
                if (distInput) distInput.classList.add('input-error');
            } else {
                if (distInput) distInput.classList.remove('input-error');
            }
        } else {
            if (distInput) distInput.classList.remove('input-error');
        }

        // 連結文字列によるNGワード迂回判定
        // 「障害」選択時はNGワード判定の範囲を「レース名 + レース場 + コース」にする
        const rawCombinedText = isObstacleMode ? (
            (state.textLine1 || '') +
            (state.detailCourse || '') +
            (state.detailFieldType || '')
        ).replace(/\s+/g, '') : (
            (state.textLine1 || '') +
            (state.detailCourse || '') +
            (state.detailFieldType || '') +
            (state.detailDirection || '') +
            (state.detailDist || '') +
            (state.textLine2 || '')
        ).replace(/\s+/g, '');
        const combinedResult = checkTextError(rawCombinedText);

        const isError = line1Result.error || line2Result.error || isCourseError || isFieldTypeError || isDistError || combinedResult.error;
        isNgWordDetected = isError;

        if (textLine1Input) {
            if (line1Result.error) {
                textLine1Input.classList.add('input-error');
                if (textLine1Error) {
                    textLine1Error.style.display = 'flex';
                    const span = textLine1Error.querySelector('span');
                    if (span) {
                        if (line1Result.type === 'emoji') {
                            span.textContent = '絵文字は使用できません';
                        } else if (!isObstacleMode && state.textLine1 && state.textLine1.includes('障害')) {
                            span.innerHTML = 'コースを「障害」に変更してください<button type="button" id="changeToObstacleBtn" style="background:none;border:none;color:inherit;font:inherit;text-decoration:underline;font-weight:bold;cursor:pointer;padding:0 2px;margin-left:2px;">（変更する）</button>';
                        } else {
                            span.textContent = 'エラーが発生しました';
                        }
                    }
                }
            } else {
                textLine1Input.classList.remove('input-error');
                if (textLine1Error) textLine1Error.style.display = 'none';
            }
        }

        renderCanvasSafe(50);
        return isError;
    }

    // Toast Notification
    let toastTimeout;
    function showToast(msg, duration = 2500) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
    }

    // Offscreen Canvas Cache
    const textCacheCanvas = document.createElement('canvas');
    textCacheCanvas.width = CANVAS_WIDTH;
    textCacheCanvas.height = CANVAS_HEIGHT;
    const textCacheCtx = textCacheCanvas.getContext('2d');
    let isTextCacheDirty = true;

    function markTextCacheDirty() {
        isTextCacheDirty = true;
    }

    // WebFont Safety Wrapper & 2-Pass Render
    let fontLoadTimer = null;
    function renderCanvasSafe(delay = 100) {
        markTextCacheDirty();
        if (fontLoadTimer) clearTimeout(fontLoadTimer);
        fontLoadTimer = setTimeout(() => {
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    renderCanvas();
                    // 2-Pass render to guarantee text measurement after web font load
                    requestAnimationFrame(() => {
                        markTextCacheDirty();
                        renderCanvas();
                    });
                }).catch(() => {
                    renderCanvas();
                });
            } else {
                renderCanvas();
            }
        }, delay);
    }

    // 括弧の空き容量トリミング用Set（開き括弧：左側50%削り、閉じ括弧：右側50%削り）
    const OPENING_BRACKETS = new Set(['（', '「', '［', '｛', '『', '【', '＜', '《', '〔', '〖', '“', '‘']);
    const CLOSING_BRACKETS = new Set(['）', '」', '］', '｝', '』', '】', '＞', '》', '〕', '〗', '”', '’']);

    // 2行目のスペース間隔設定
    const ITEM_INTERNAL_SPACE = ' '; // 項目内のスペース数
    const ITEM_BETWEEN_SPACE = ' ';  // 項目間のスペース数

    // Replace 1+ contiguous spaces (full or half width) with ITEM_INTERNAL_SPACE
    function formatItemSpace(val) {
        if (!val) return '';
        return val.trim().replace(/[\s\u3000]+/g, ITEM_INTERNAL_SPACE);
    }

    // Line 2 Detail Controls Sync (6 items)
    function syncLine2FromDetails() {
        const parts = [
            formatItemSpace(state.detailCourse),
            formatItemSpace(state.detailFieldType),
            formatItemSpace(state.detailDirection),
            formatItemSpace(state.detailDist),
            formatItemSpace(state.detailWeather),
            formatItemSpace(state.detailCondition)
        ].filter(p => p.length > 0);

        const joined = parts.join(ITEM_BETWEEN_SPACE);
        state.textLine2 = joined;
        validateAllInputs();
    }

    const hasBeenCustomCleared = { detailCourse: false, detailFieldType: false, detailDist: false, detailCondition: false };

    let savedPreObihiroDetails = null;
    let previousCourseVal = '';

    function getAutoDirection(courseName, distStr) {
        if (!courseName) return null;
        const c = courseName.trim();
        const distNum = parseInt(String(distStr).replace(/[^\d]/g, ''), 10);

        // 直線: 新潟 (1000mの場合)
        if (c === '新潟' && distNum === 1000) {
            return '直線';
        }

        // CSVマップの参照
        if (racecourseMap[c]) {
            return racecourseMap[c];
        }

        // フォールバック (CSV未読込時)
        const rightCourses = ['札幌', '函館', '福島', '中山', '京都', '阪神', '小倉', '門別', '水沢', '金沢', '笠松', '名古屋', '園田', '姫路', '高知', '佐賀', 'アスコット', 'グッドウッド', 'シャティン', 'シャンティイ', 'ドーヴィル', 'ニューマーケット', 'ハッピーバレー', 'ランドウィック', 'ローズヒル', 'ロンシャン'];
        if (rightCourses.includes(c)) {
            return '右';
        }

        const leftCourses = ['新潟', '東京', '中京', '盛岡', '浦和', '船橋', '川崎', 'アブドゥルアジーズ', 'ヴェリフェディ', 'ガルフストリーム', 'キーンランド', 'クランジ', 'コーフィールド', 'サラトガ', 'サンクルー', 'サンタアニタパーク', 'セランゴール', 'ソウル', 'チャーチルダウンズ', 'デルマー', 'ナドアルシバ', 'ピムリコ', 'フレミントン', 'ベルモントパーク', 'ムーニーバレー', 'メイダン', 'ヨーク', 'レパーズタウン'];
        if (leftCourses.includes(c)) {
            return '左';
        }

        return null;
    }

    function checkObihiroSpecial() {
        // 1. コース種別 (ばんえい)
        state.detailFieldType = 'ばんえい';
        updateSelectMatching('fieldTypeSelect', 'fieldTypeInput', 'ばんえい', null, fieldTypeCharHint);
        flashElement(document.getElementById('fieldTypeSelect'));

        // 2. 回り (直線)
        state.detailDirection = '直線';
        updateSelectMatching('directionSelect', null, '直線');
        flashElement(document.getElementById('directionSelect'));

        // 3. 距離 (200m)
        state.detailDist = '200m';
        updateSelectMatching('distSelect', 'distInput', '200m', 'distCustomWrapper');
        flashElement(document.getElementById('distSelect'));

        // 4. 馬場水分 (1.5%)
        state.detailCondition = '1.5%';
        updateSelectMatching('conditionSelect', 'conditionInput', '1.5%', 'conditionCustomWrapper');
        flashElement(document.getElementById('conditionSelect'));

        syncLine2FromDetails();
    }

    function autoUpdateDirection() {
        const courseVal = state.detailCourse || '';
        const distVal = state.detailDist || '';
        const targetDirection = getAutoDirection(courseVal, distVal);
        if (!targetDirection) return;

        const currentDirection = directionSelect ? directionSelect.value : (state.detailDirection || '');

        // 既に targetDirection を含む場合は更新しない（例: 「左」に対し「左内」「左外」等の場合は更新なし）
        if (currentDirection && currentDirection.includes(targetDirection)) {
            return;
        }

        state.detailDirection = targetDirection;
        updateSelectMatching('directionSelect', null, targetDirection);
        flashElement(document.getElementById('directionSelect'));
        syncLine2FromDetails();
    }

    function checkRestoreFromObihiro(newCourse, restoreAllFields = true) {
        const currentCourse = (newCourse || '').trim();
        if (previousCourseVal === '帯広' && currentCourse !== '帯広') {
            if (savedPreObihiroDetails) {
                if (restoreAllFields) {
                    if (savedPreObihiroDetails.fieldType) {
                        state.detailFieldType = savedPreObihiroDetails.fieldType;
                        updateSelectMatching('fieldTypeSelect', 'fieldTypeInput', savedPreObihiroDetails.fieldType, null, fieldTypeCharHint);
                        flashElement(document.getElementById('fieldTypeSelect'));
                    }
                    if (savedPreObihiroDetails.direction) {
                        state.detailDirection = savedPreObihiroDetails.direction;
                        updateSelectMatching('directionSelect', null, savedPreObihiroDetails.direction);
                        flashElement(document.getElementById('directionSelect'));
                    }
                    if (savedPreObihiroDetails.dist) {
                        state.detailDist = savedPreObihiroDetails.dist;
                        updateSelectMatching('distSelect', 'distInput', savedPreObihiroDetails.dist, 'distCustomWrapper');
                        flashElement(document.getElementById('distSelect'));
                    }
                }
                if (savedPreObihiroDetails.condition) {
                    state.detailCondition = savedPreObihiroDetails.condition;
                    updateSelectMatching('conditionSelect', 'conditionInput', savedPreObihiroDetails.condition, 'conditionCustomWrapper');
                    flashElement(document.getElementById('conditionSelect'));
                }
                savedPreObihiroDetails = null;
            }
        }
        previousCourseVal = currentCourse;
    }

    function onCourseOrDistChange() {
        const currentCourse = (state.detailCourse || '').trim();

        // 他のコースから「帯広」に変更された「その瞬間」のみ一括プリセットを設定
        if (currentCourse === '帯広') {
            if (previousCourseVal !== '帯広') {
                savedPreObihiroDetails = {
                    fieldType: state.detailFieldType,
                    direction: state.detailDirection,
                    dist: state.detailDist,
                    condition: state.detailCondition
                };
                checkObihiroSpecial();
            }
            previousCourseVal = currentCourse;
            return;
        }

        // 「帯広」から他コースに変更された場合、帯広変更前の状態に復元
        checkRestoreFromObihiro(currentCourse, true);
        autoUpdateDirection();
    }

    function setupCustomDetailPair(selectEl, inputEl, stateProp, wrapperEl = null, hintEl = null, onUpdate = null) {
        if (!selectEl) return;

        selectEl.addEventListener('change', (e) => {
            const val = e.target.value;
            const targetDisplayEl = wrapperEl || inputEl;

            if (val === 'custom') {
                if (targetDisplayEl) targetDisplayEl.style.display = 'block';
                if (hintEl) hintEl.style.display = 'block';
                if (inputEl) {
                    if (!hasBeenCustomCleared[stateProp]) {
                        inputEl.value = '';
                        state[stateProp] = '';
                        hasBeenCustomCleared[stateProp] = true;
                    } else {
                        if (stateProp === 'detailDist') {
                            const digitsOnly = inputEl.value.replace(/[^\d]/g, '');
                            inputEl.value = digitsOnly;
                            state[stateProp] = digitsOnly ? digitsOnly + 'm' : '';
                        } else if (stateProp === 'detailCondition') {
                            let cleanVal = inputEl.value.replace(/[^\d.]/g, '');
                            const parts = cleanVal.split('.');
                            if (parts.length > 2) cleanVal = parts[0] + '.' + parts.slice(1).join('');
                            inputEl.value = cleanVal;
                            state[stateProp] = cleanVal ? cleanVal + '%' : '';
                        } else {
                            state[stateProp] = inputEl.value;
                        }
                    }
                    inputEl.focus();
                }
            } else {
                if (targetDisplayEl) targetDisplayEl.style.display = 'none';
                if (hintEl) hintEl.style.display = 'none';
                state[stateProp] = val;
                if (inputEl) inputEl.value = val;
            }
            syncLine2FromDetails();
            if (typeof onUpdate === 'function') onUpdate();
        });

        if (inputEl) {
            inputEl.addEventListener('input', (e) => {
                if (stateProp === 'detailDist') {
                    let digitsOnly = e.target.value.replace(/[^\d]/g, '');
                    if (digitsOnly !== e.target.value) {
                        e.target.value = digitsOnly;
                    }
                    state[stateProp] = digitsOnly ? digitsOnly + 'm' : '';
                } else if (stateProp === 'detailCondition') {
                    let cleanVal = e.target.value.replace(/[^\d.]/g, '');
                    const parts = cleanVal.split('.');
                    if (parts.length > 2) cleanVal = parts[0] + '.' + parts.slice(1).join('');
                    if (cleanVal !== e.target.value) {
                        e.target.value = cleanVal;
                    }
                    state[stateProp] = cleanVal ? cleanVal + '%' : '';
                } else {
                    state[stateProp] = e.target.value;
                }
                syncLine2FromDetails();
                if (typeof onUpdate === 'function') onUpdate();
            });
        }
    }

    function setupStandardDetailSelect(selectEl, stateProp) {
        if (!selectEl) return;
        selectEl.addEventListener('change', (e) => {
            state[stateProp] = e.target.value;
            syncLine2FromDetails();
        });
    }

    function updateSelectMatching(selectId, inputId, val, wrapperId, hintId) {
        const selectEl = document.getElementById(selectId);
        const inputEl = document.getElementById(inputId);
        const wrapperEl = wrapperId ? document.getElementById(wrapperId) : null;
        const hintEl = hintId ? document.getElementById(hintId) : null;
        if (!selectEl) return;

        const targetDisplayEl = wrapperEl || inputEl;
        const matchingOption = Array.from(selectEl.options).find(opt => opt.value === val);

        if (matchingOption) {
            selectEl.value = matchingOption.value;
            if (inputEl) {
                if (selectId === 'distSelect' && val) {
                    inputEl.value = val.replace(/[^\d]/g, '');
                } else if (selectId === 'conditionSelect' && val) {
                    inputEl.value = val.replace(/[^\d.]/g, '');
                } else {
                    inputEl.value = val;
                }
            }
            if (targetDisplayEl) targetDisplayEl.style.display = 'none';
            if (hintEl) hintEl.style.display = 'none';
        } else if (Array.from(selectEl.options).some(opt => opt.value === 'custom')) {
            selectEl.value = 'custom';
            if (inputEl) {
                if (selectId === 'distSelect' && val) {
                    inputEl.value = val.replace(/[^\d]/g, '');
                } else if (selectId === 'conditionSelect' && val) {
                    inputEl.value = val.replace(/[^\d.]/g, '');
                } else {
                    inputEl.value = val || '';
                }
            }
            if (targetDisplayEl) targetDisplayEl.style.display = 'block';
            if (hintEl) hintEl.style.display = 'block';
        }
    }

    const flashTimeouts = new WeakMap();

    function flashElement(el) {
        if (!el) return;
        if (flashTimeouts.has(el)) {
            clearTimeout(flashTimeouts.get(el));
        }
        el.classList.remove('flash-updated');
        void el.offsetWidth;
        el.classList.add('flash-updated');
        const timerId = setTimeout(() => {
            el.classList.remove('flash-updated');
            flashTimeouts.delete(el);
        }, 1050);
        flashTimeouts.set(el, timerId);
    }

    const distCustomWrapper = document.getElementById('distCustomWrapper');
    const conditionCustomWrapper = document.getElementById('conditionCustomWrapper');

    setupCustomDetailPair(courseSelect, courseInput, 'detailCourse', null, courseCharHint, onCourseOrDistChange);
    setupCustomDetailPair(fieldTypeSelect, fieldTypeInput, 'detailFieldType', null, fieldTypeCharHint);
    setupStandardDetailSelect(directionSelect, 'detailDirection');
    setupCustomDetailPair(distSelect, distInput, 'detailDist', distCustomWrapper, null, onCourseOrDistChange);
    setupStandardDetailSelect(weatherSelect, 'detailWeather');
    setupCustomDetailPair(conditionSelect, conditionInput, 'detailCondition', conditionCustomWrapper);

    // Initial Line 2 Sync
    syncLine2FromDetails();

    if (clearRaceInputBtn && textLine1Input) {
        clearRaceInputBtn.style.display = textLine1Input.value ? 'block' : 'none';
    }

    // --- Racecourse List CSV Logic ---
    let racecourseMap = {};

    async function loadRacecourseList() {
        try {
            const versionBadge = document.querySelector('.version-badge');
            const version = versionBadge ? versionBadge.textContent.trim().replace(/^v/, '') : '';
            const queryParam = version ? `?v=${version}` : '';

            const response = await fetch(`data/racecourse_list.csv${queryParam}`);
            if (!response.ok) return;

            const csvText = await response.text();
            if (typeof Papa === 'undefined') return;

            const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
            parsed.forEach(row => {
                const name = row.course_name ? row.course_name.trim() : '';
                const dir = row.direction ? row.direction.trim() : '';
                if (name && dir) {
                    racecourseMap[name] = dir;
                }
            });
        } catch (err) {
            console.warn('Could not load racecourse_list.csv:', err);
        }
    }

    // --- Race List CSV & Autocomplete Suggestion Logic ---
    let allRaceList = [];

    function mapCsvGradeToUiGrade(grade) {
        if (!grade) return '';
        const g = grade.trim();
        if (g === 'G1' || g === 'G2' || g === 'G3' || g === 'OP' || g === 'EX') return g;
        if (g === 'Pre-OP') return 'Pre-OP';
        return '';
    }

    function getDirectionLabel(dirRaw) {
        if (!dirRaw) return '';
        const d = dirRaw.trim();
        if (d === '左' || d === '右' || d === '直線' || d === '左内' || d === '左外' || d === '右内' || d === '右外') {
            return d;
        }
        if (d.includes('直線') || d.includes('直')) return '直線';
        if (d.includes('左内')) return '左内';
        if (d.includes('左外')) return '左外';
        if (d.includes('右内')) return '右内';
        if (d.includes('右外')) return '右外';
        if (d.includes('左') || d.toLowerCase().includes('left')) return '左';
        if (d.includes('右') || d.toLowerCase().includes('right')) return '右';
        return d;
    }

    async function loadRaceList() {
        try {
            const response = await fetch('data/race_list.csv');
            if (!response.ok) return;
            const csvText = await response.text();
            if (typeof Papa === 'undefined') return;

            const csvData = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
            const uniqueMap = {};

            csvData.forEach(row => {
                const name = row.race_name;
                if (!name || uniqueMap[name]) return;
                uniqueMap[name] = {
                    name: name,
                    kana: row.race_name_kana || '',
                    grade: row.race_grade || '',
                    track: row.race_track || '',
                    fieldType: row.fleld_type || '',
                    distance: row.distance || '',
                    direction: getDirectionLabel(row.direction || '')
                };
            });

            allRaceList = Object.values(uniqueMap);
            setupRaceNameSuggestion();
        } catch (err) {
            console.warn('Could not load race_list.csv:', err);
        }
    }

    function setupRaceNameSuggestion() {
        if (!textLine1Input || !raceSuggestionsBox || !clearRaceInputBtn) return;

        function renderRaceSuggestions(val) {
            state.textLine1 = val;
            const keyword = val.toLowerCase().trim();
            raceSuggestionsBox.innerHTML = '';

            clearRaceInputBtn.style.display = keyword ? 'block' : 'none';

            if (!keyword || allRaceList.length === 0) {
                raceSuggestionsBox.style.display = 'none';
                validateAllInputs();
                return;
            }

            const matches = allRaceList.filter(item =>
                item.name.toLowerCase().includes(keyword) ||
                (item.kana && item.kana.toLowerCase().includes(keyword))
            ).slice(0, 5);

            if (matches.length === 0) {
                raceSuggestionsBox.style.display = 'none';
                validateAllInputs();
                return;
            }

            raceSuggestionsBox.style.display = 'block';
            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';

                const mappedGrade = mapCsvGradeToUiGrade(match.grade);
                const gradeClass = match.grade ? match.grade.toLowerCase().replace('-', '_') : '';
                const badgeHtml = mappedGrade ? `<span class="suggestion-grade-badge grade-${gradeClass}">${mappedGrade}</span>` : '';

                div.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            ${badgeHtml}
                            <span style="font-weight: 700;">${match.name}</span>
                        </div>
                        <span class="suggestion-sub-value" style="font-size: 0.8rem; color: #888; white-space: nowrap; margin-left: 10px;">${match.track} ${match.fieldType}${match.direction ? ' ' + match.direction : ''}${match.distance ? ' ' + match.distance : ''}</span>
                    </div>
                `;

                div.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                });

                div.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });

                div.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectRaceSuggestion(match);
                });
                raceSuggestionsBox.appendChild(div);
            });

            validateAllInputs();
        }

        textLine1Input.addEventListener('input', (e) => {
            renderRaceSuggestions(e.target.value);
        });

        textLine1Input.addEventListener('focus', () => {
            setPresetsDisabled(true);
            renderRaceSuggestions(textLine1Input.value);
        });

        textLine1Input.addEventListener('blur', () => {
            setPresetsDisabled(false);
        });

        textLine1Input.addEventListener('keydown', (e) => {
            if (e.isComposing) return;
            if (e.key === 'Enter') {
                e.preventDefault();
                const keyword = textLine1Input.value.toLowerCase().trim();
                const matches = allRaceList.filter(item =>
                    item.name.toLowerCase().includes(keyword) ||
                    (item.kana && item.kana.toLowerCase().includes(keyword))
                );
                if (matches.length === 1) {
                    selectRaceSuggestion(matches[0]);
                } else {
                    raceSuggestionsBox.innerHTML = '';
                    raceSuggestionsBox.style.display = 'none';
                }
                textLine1Input.blur();
            }
        });

        clearRaceInputBtn.addEventListener('click', () => {
            textLine1Input.value = '';
            state.textLine1 = '';
            clearRaceInputBtn.style.display = 'none';
            raceSuggestionsBox.innerHTML = '';
            raceSuggestionsBox.style.display = 'none';
            textLine1Input.focus();
            validateAllInputs();
        });

        document.addEventListener('click', (e) => {
            if (!textLine1Input.contains(e.target) && !raceSuggestionsBox.contains(e.target) && !clearRaceInputBtn.contains(e.target)) {
                raceSuggestionsBox.innerHTML = '';
                raceSuggestionsBox.style.display = 'none';
            }
        });

        if (textLine1Error) {
            textLine1Error.addEventListener('click', (e) => {
                const btn = e.target.closest('#changeToObstacleBtn');
                if (btn) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (fieldTypeSelect) {
                        state.detailFieldType = '障害';
                        updateSelectMatching('fieldTypeSelect', 'fieldTypeInput', '障害');
                        flashElement(fieldTypeSelect);
                        syncLine2FromDetails();
                    }
                }
            });
        }
    }

    function selectRaceSuggestion(match) {
        textLine1Input.value = match.name;
        state.textLine1 = match.name;
        raceSuggestionsBox.innerHTML = '';
        raceSuggestionsBox.style.display = 'none';
        clearRaceInputBtn.style.display = 'block';

        // Update Course, FieldType, Direction, Distance (Keep Weather and Condition untouched)
        if (match.track) {
            checkRestoreFromObihiro(match.track, false);
            state.detailCourse = match.track;
            updateSelectMatching('courseSelect', 'courseInput', match.track);
            flashElement(document.getElementById('courseSelect'));
        }

        if (match.fieldType) {
            state.detailFieldType = match.fieldType;
            updateSelectMatching('fieldTypeSelect', 'fieldTypeInput', match.fieldType);
            flashElement(document.getElementById('fieldTypeSelect'));
        }

        if (match.direction) {
            state.detailDirection = match.direction;
            updateSelectMatching('directionSelect', null, match.direction);
            flashElement(document.getElementById('directionSelect'));
        }

        if (match.distance) {
            state.detailDist = match.distance;
            updateSelectMatching('distSelect', 'distInput', match.distance, 'distCustomWrapper');
            flashElement(document.getElementById('distSelect'));
        }

        syncLine2FromDetails();
        textLine1Input.blur();
    }

    // --- Render Race Title Text to Offscreen Cache ---
    function renderTextToCache() {
        textCacheCtx.clearRect(0, 0, textCacheCanvas.width, textCacheCanvas.height);

        if (!state.textLine1 && !state.textLine2) return;

        const fontStack = "'Noto Sans JP', -apple-system, sans-serif";
        const line1FontSize = state.textSizeLine1; // Line 1 font size (default 188px)
        const line2FontSize = state.textSizeLine2; // Line 2 font size (default 40px)

        const fontLine1 = `900 ${line1FontSize}px ${fontStack}`;
        const fontLine2 = `700 ${line2FontSize}px ${fontStack}`;

        const centerX = textCacheCanvas.width / 2;
        const centerY = textCacheCanvas.height / 2;
        const maxAllowedWidth = textCacheCanvas.width * 0.88;

        textCacheCtx.save();
        textCacheCtx.translate(centerX, centerY);

        // Default base Y-position shifted 3% (+18px) down so slider posY=50% reflects the lowered position
        const line1Y = -line1FontSize * 0.22 + (textCacheCanvas.height * 0.03);

        // 1. Line 1: Race Name (長体 base scaleX = 0.85 with bracket margin kerning)
        if (state.textLine1) {
            const line1Text = state.textLine1;
            const textLen = line1Text.length;
            const isThreeChars = (textLen === 3);

            textCacheCtx.font = fontLine1;

            let charInfos = [];
            let totalRawWidth = 0;
            const extraCharSpacing = isThreeChars ? line1FontSize * 0.15 : 0;

            for (let i = 0; i < textLen; i++) {
                const ch = line1Text[i];
                const fullW = textCacheCtx.measureText(ch).width;
                let effW = fullW;
                let drawOffsetX = 0;

                if (OPENING_BRACKETS.has(ch)) {
                    effW = fullW * 0.5;
                    drawOffsetX = -fullW * 0.25;
                } else if (CLOSING_BRACKETS.has(ch)) {
                    effW = fullW * 0.5;
                    drawOffsetX = fullW * 0.25;
                }

                charInfos.push({ ch, fullW, effW, drawOffsetX });
                totalRawWidth += effW;
            }

            if (isThreeChars) {
                totalRawWidth += extraCharSpacing * 2;
            }

            let baseScaleX1 = 0.85;
            const widthAtBaseScale = totalRawWidth * baseScaleX1;

            let line1ScaleX = baseScaleX1;
            if (widthAtBaseScale > maxAllowedWidth) {
                line1ScaleX = baseScaleX1 * (maxAllowedWidth / widthAtBaseScale);
            }

            textCacheCtx.save();
            textCacheCtx.translate(0, line1Y);
            textCacheCtx.scale(line1ScaleX, 1.0);
            textCacheCtx.fillStyle = '#000000';
            textCacheCtx.textAlign = 'center';
            textCacheCtx.textBaseline = 'middle';

            let curX = -totalRawWidth / 2;
            for (let i = 0; i < textLen; i++) {
                const info = charInfos[i];
                const charCenterX = curX + info.effW / 2 + info.drawOffsetX;
                textCacheCtx.fillText(info.ch, charCenterX, 0);
                curX += info.effW + (isThreeChars ? extraCharSpacing : 0);
            }
            textCacheCtx.restore();
        }

        // 2. Line 2: Race Details (Constant center-to-center distance from Line 1)
        if (state.textLine2) {
            const line2Text = state.textLine2;
            textCacheCtx.font = fontLine2;
            if ('letterSpacing' in textCacheCtx) {
                textCacheCtx.letterSpacing = '1.25px'; // 2行目の文字間隔
            }

            const rawLine2Width = textCacheCtx.measureText(line2Text).width;
            let line2ScaleX = 1.0;
            if (rawLine2Width > maxAllowedWidth) {
                line2ScaleX = maxAllowedWidth / rawLine2Width;
            }

            // Fixed distance from Line 1 center (line1Y) to Line 2 center: 120px
            const FIXED_CENTER_DISTANCE = 120;
            const line2Y = line1Y + FIXED_CENTER_DISTANCE;

            textCacheCtx.save();
            textCacheCtx.translate(0, line2Y);
            textCacheCtx.scale(line2ScaleX, 1.0);
            textCacheCtx.fillStyle = '#000000';
            textCacheCtx.textAlign = 'center';
            textCacheCtx.textBaseline = 'middle';
            textCacheCtx.fillText(line2Text, 0, 0);
            textCacheCtx.restore();
        }

        textCacheCtx.restore();
    }

    // Clamp Image Position
    function clampImagePosition() {
        if (!state.bgImage || state.imgScale < 100) return;

        const rotDeg = state.imgRotation || 0;
        const isSwapped = (rotDeg === 90 || rotDeg === 270);

        const effImgW = isSwapped ? state.bgImage.height : state.bgImage.width;
        const effImgH = isSwapped ? state.bgImage.width : state.bgImage.height;

        const imgRatio = effImgW / effImgH;
        const canvasRatio = canvas.width / canvas.height;
        let renderW, renderH;

        if (imgRatio > canvasRatio) {
            renderH = canvas.height;
            renderW = canvas.height * imgRatio;
        } else {
            renderW = canvas.width;
            renderH = canvas.width / imgRatio;
        }

        const scaleRatio = state.imgScale / 100;
        const finalW = renderW * scaleRatio;
        const finalH = renderH * scaleRatio;

        const maxOffsetX = (finalW - canvas.width) / 2;
        const maxOffsetY = (finalH - canvas.height) / 2;

        const maxImgX = (maxOffsetX / canvas.width) * 100;
        const maxImgY = (maxOffsetY / canvas.height) * 100;

        state.imgX = Math.max(-maxImgX, Math.min(maxImgX, state.imgX));
        state.imgY = Math.max(-maxImgY, Math.min(maxImgY, state.imgY));
    }

    // Render Canvas
    function renderCanvas() {
        clampImagePosition();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Background Image or Default Light Gray
        if (state.bgImage) {
            // 明るさ調整がONの場合は下地を白色(#ffffff)で塗りつぶす
            if (state.showBrighten) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const rotDeg = state.imgRotation || 0;
            const isSwapped = (rotDeg === 90 || rotDeg === 270);

            const effImgW = isSwapped ? state.bgImage.height : state.bgImage.width;
            const effImgH = isSwapped ? state.bgImage.width : state.bgImage.height;

            const imgRatio = effImgW / effImgH;
            const canvasRatio = canvas.width / canvas.height;
            let renderW, renderH, baseRenderX, baseRenderY;

            if (imgRatio > canvasRatio) {
                renderH = canvas.height;
                renderW = canvas.height * imgRatio;
                baseRenderX = (canvas.width - renderW) / 2;
                baseRenderY = 0;
            } else {
                renderW = canvas.width;
                renderH = canvas.width / imgRatio;
                baseRenderX = 0;
                baseRenderY = (canvas.height - renderH) / 2;
            }

            const scaleRatio = state.imgScale / 100;
            const finalW = renderW * scaleRatio;
            const finalH = renderH * scaleRatio;
            const offsetX = (state.imgX * canvas.width) / 100;
            const offsetY = (state.imgY * canvas.height) / 100;

            const finalCenterX = baseRenderX + renderW / 2 + offsetX;
            const finalCenterY = baseRenderY + renderH / 2 + offsetY;

            ctx.save();
            ctx.translate(finalCenterX, finalCenterY);
            ctx.rotate((rotDeg * Math.PI) / 180);

            if (state.showBrighten) {
                // 白下地の上で不透明度をコントロールして明るく見せる (100%->1.0, 130%->~0.77, 200%->0.5)
                const alpha = Math.max(0.1, Math.min(1.0, 100 / state.imgBrightness));
                ctx.globalAlpha = alpha;
            }

            const drawW = isSwapped ? finalH : finalW;
            const drawH = isSwapped ? finalW : finalH;
            ctx.drawImage(state.bgImage, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();
        } else {
            ctx.fillStyle = '#e8eaed';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Optional CinemaScope Letterbox (上下黒帯)
        if (state.showLetterbox) {
            const barHeight = canvas.height * 0.12;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, barHeight);
            ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
        }

        // Skip text rendering if NG word detected
        if (isNgWordDetected) {
            return;
        }

        // 3. Draw Cached Text Layer
        if (isTextCacheDirty) {
            renderTextToCache();
            isTextCacheDirty = false;
        }

        const centerX = (canvas.width * state.posX) / 100;
        const centerY = (canvas.height * state.posY) / 100;

        ctx.drawImage(textCacheCanvas, centerX - textCacheCanvas.width / 2, centerY - textCacheCanvas.height / 2);
    }

    // Interactive Drag & Drop on Canvas
    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        if (state.isCanvasLocked) return;
        state.isDragging = true;
        state.dragStart = getCanvasCoords(e);
    });

    canvas.addEventListener('touchstart', (e) => {
        if (state.isCanvasLocked) return;
        state.isDragging = true;
        state.dragStart = getCanvasCoords(e);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
        if (!state.isDragging) return;
        const coords = getCanvasCoords(e);
        const dx = coords.x - state.dragStart.x;
        const dy = coords.y - state.dragStart.y;
        state.dragStart = coords;

        if (state.dragTarget === 'image') {
            state.imgX = Math.max(-100, Math.min(100, state.imgX + (dx / canvas.width) * 100));
            state.imgY = Math.max(-100, Math.min(100, state.imgY + (dy / canvas.height) * 100));
        } else {
            state.posX = Math.max(5, Math.min(95, state.posX + (dx / canvas.width) * 100));
            state.posY = Math.max(5, Math.min(95, state.posY + (dy / canvas.height) * 100));

            posXInput.value = Math.round(state.posX);
            posXVal.textContent = `${Math.round(state.posX)}%`;
            posYInput.value = Math.round(state.posY);
            posYVal.textContent = `${Math.round(state.posY)}%`;
        }

        renderCanvas();
    });

    window.addEventListener('touchmove', (e) => {
        if (!state.isDragging) return;
        const coords = getCanvasCoords(e);
        const dx = coords.x - state.dragStart.x;
        const dy = coords.y - state.dragStart.y;
        state.dragStart = coords;

        if (state.dragTarget === 'image') {
            state.imgX = Math.max(-100, Math.min(100, state.imgX + (dx / canvas.width) * 100));
            state.imgY = Math.max(-100, Math.min(100, state.imgY + (dy / canvas.height) * 100));
        } else {
            state.posX = Math.max(5, Math.min(95, state.posX + (dx / canvas.width) * 100));
            state.posY = Math.max(5, Math.min(95, state.posY + (dy / canvas.height) * 100));

            posXInput.value = Math.round(state.posX);
            posXVal.textContent = `${Math.round(state.posX)}%`;
            posYInput.value = Math.round(state.posY);
            posYVal.textContent = `${Math.round(state.posY)}%`;
        }

        renderCanvas();
    }, { passive: true });

    window.addEventListener('mouseup', () => { state.isDragging = false; });
    window.addEventListener('touchend', () => { state.isDragging = false; });

    // File Upload Handlers
    function handleFile(file) {
        if (!file) return;

        const isHeic = file.name && (file.name.toLowerCase().endsWith('.heic') ||
            file.name.toLowerCase().endsWith('.heif')) ||
            file.type === 'image/heic' ||
            file.type === 'image/heif';

        if (!isHeic && file.type && !file.type.startsWith('image/')) {
            showToast('画像ファイルを選択してください');
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        function scrollToRaceName() {
            if (textLine1Input) {
                const formGroup = textLine1Input.closest('.form-group') || textLine1Input;
                const offset = 24;
                const elementPosition = formGroup.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = Math.max(0, elementPosition - offset);

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }

        img.onload = () => {
            state.bgImage = img;
            state.imgRotation = 0;
            renderCanvasSafe(50);
            showToast('画像を読み込みました');
            scrollToRaceName();
        };

        img.onerror = async () => {
            URL.revokeObjectURL(objectUrl);

            if (isHeic) {
                showToast('HEIC画像を変換中...', 4000);
                try {
                    const converter = (typeof HeicTo !== 'undefined') ? HeicTo :
                                      (typeof heicTo !== 'undefined') ? heicTo :
                                      (window.HeicTo || window.heicTo || null);
                    if (!converter) {
                        showToast('HEIC画像の変換に対応していません。JPEG/PNG画像をご利用ください');
                        return;
                    }

                    const convertedBlob = await converter({
                        blob: file,
                        type: 'image/jpeg',
                        quality: 0.90
                    });

                    const targetBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    readBlobAndRender(targetBlob);
                } catch (err) {
                    console.error('HEIC conversion error:', err);
                    showToast('HEIC画像の変換に対応していません。JPEG/PNG形式をお試しください', 4000);
                }
            } else {
                showToast('画像の読み込みに失敗しました');
            }
        };

        img.src = objectUrl;
    }

    function readBlobAndRender(blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                state.bgImage = img;
                state.imgRotation = 0;
                renderCanvasSafe(50);
                showToast('画像を読み込みました');
                if (typeof scrollToRaceName === 'function') {
                    scrollToRaceName();
                } else if (textLine1Input) {
                    const formGroup = textLine1Input.closest('.form-group') || textLine1Input;
                    const offset = 24;
                    const elementPosition = formGroup.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: Math.max(0, elementPosition - offset), behavior: 'smooth' });
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(blob);
    }

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    if (pasteImgBtn) {
        pasteImgBtn.addEventListener('click', async () => {
            try {
                if (!navigator.clipboard || !navigator.clipboard.read) {
                    showToast('お使いのブラウザはクリップボードの読み取りに対応していません');
                    return;
                }
                const clipboardItems = await navigator.clipboard.read();
                let imageFound = false;

                for (const item of clipboardItems) {
                    const imageType = item.types.find(type => type.startsWith('image/'));
                    if (imageType) {
                        const blob = await item.getType(imageType);
                        handleFile(blob);
                        imageFound = true;
                        break;
                    }
                }

                if (!imageFound) {
                    showToast('クリップボードに画像が見つかりませんでした');
                }
            } catch (err) {
                console.error(err);
                showToast('クリップボードの画像読み取りに失敗しました（権限が必要です）');
            }
        });
    }

    if (rotateImgLeftBtn) {
        rotateImgLeftBtn.addEventListener('click', () => {
            if (!state.bgImage) {
                showToast('回転する画像が選択されていません');
                return;
            }
            state.imgRotation = (state.imgRotation + 270) % 360;
            renderCanvas();
            showToast(`画像を ${state.imgRotation}° 回転しました`);
        });
    }

    if (rotateImgRightBtn) {
        rotateImgRightBtn.addEventListener('click', () => {
            if (!state.bgImage) {
                showToast('回転する画像が選択されていません');
                return;
            }
            state.imgRotation = (state.imgRotation + 90) % 360;
            renderCanvas();
            showToast(`画像を ${state.imgRotation}° 回転しました`);
        });
    }

    if (resetImgBtn) {
        resetImgBtn.addEventListener('click', () => {
            state.bgImage = null;
            state.imgRotation = 0;
            state.imgX = 0;
            state.imgY = 0;
            state.imgScale = 100;
            fileInput.value = '';
            if (imgScaleInput) {
                imgScaleInput.value = 100;
                imgScaleVal.textContent = '100%';
            }
            renderCanvasSafe(50);
            showToast('選択中の画像をリセットしました');
        });
    }

    window.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                handleFile(blob);
                break;
            }
        }
    });

    if (redrawBtn) {
        redrawBtn.addEventListener('click', () => {
            renderCanvasSafe(0);
            showToast('キャンバスを再描画しました');
        });
    }

    // Quick Race Presets
    const RACE_PRESETS = {
        '東京優駿': { course: '東京', fieldType: '芝', direction: '左', dist: '2400m' },
        '皐月賞': { course: '中山', fieldType: '芝', direction: '右内', dist: '2000m' },
        'ジャパンカップ': { course: '東京', fieldType: '芝', direction: '左', dist: '2400m' },
        'ホープフルステークス': { course: '中山', fieldType: '芝', direction: '右内', dist: '2000m' },
        '弥生賞': { course: '中山', fieldType: '芝', direction: '右内', dist: '2000m' },
        '有馬記念': { course: '中山', fieldType: '芝', direction: '右内', dist: '2500m' },
        '宝塚記念': { course: '阪神', fieldType: '芝', direction: '右内', dist: '2200m' },
        '天皇賞（秋）': { course: '東京', fieldType: '芝', direction: '左', dist: '2000m' },
        '桜花賞': { course: '阪神', fieldType: '芝', direction: '右外', dist: '1600m' },
        'オークス': { course: '東京', fieldType: '芝', direction: '左', dist: '2400m' },
        '菊花賞': { course: '京都', fieldType: '芝', direction: '右外', dist: '3000m' },
        'マイルチャンピオンシップ': { course: '京都', fieldType: '芝', direction: '右外', dist: '1600m' },
        '中山大障害': { course: '中山', fieldType: '障害', direction: '右', dist: '4100m' }
    };

    presetChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            if (presetsWrapper && presetsWrapper.classList.contains('disabled')) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if (document.activeElement === textLine1Input) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            const rawPreset = chip.getAttribute('data-preset') || '';
            const raceName = rawPreset;
            textLine1Input.value = raceName;
            state.textLine1 = raceName;
            if (clearRaceInputBtn) clearRaceInputBtn.style.display = 'block';

            const presetData = RACE_PRESETS[rawPreset] || RACE_PRESETS[raceName];
            if (presetData) {
                if (presetData.course) {
                    checkRestoreFromObihiro(presetData.course, false);
                }
                state.detailCourse = presetData.course;
                updateSelectMatching('courseSelect', 'courseInput', presetData.course);
                flashElement(document.getElementById('courseSelect'));

                state.detailFieldType = presetData.fieldType;
                updateSelectMatching('fieldTypeSelect', 'fieldTypeInput', presetData.fieldType);
                flashElement(document.getElementById('fieldTypeSelect'));

                state.detailDirection = presetData.direction;
                updateSelectMatching('directionSelect', null, presetData.direction);
                flashElement(document.getElementById('directionSelect'));

                state.detailDist = presetData.dist;
                updateSelectMatching('distSelect', 'distInput', presetData.dist, 'distCustomWrapper');
                flashElement(document.getElementById('distSelect'));

                syncLine2FromDetails();
            } else {
                validateAllInputs();
            }
        });
    });

    if (canvasLockCheckbox) {
        canvasLockCheckbox.addEventListener('change', (e) => {
            state.isCanvasLocked = e.target.checked;
            if (state.isCanvasLocked) {
                if (canvasCard) canvasCard.classList.add('canvas-locked');
                if (canvasLockToggle) canvasLockToggle.classList.add('is-locked');
                showToast('キャンバス操作をロックしました');
            } else {
                if (canvasCard) canvasCard.classList.remove('canvas-locked');
                if (canvasLockToggle) canvasLockToggle.classList.remove('is-locked');
                showToast('キャンバス操作のロックを解除しました');
            }
        });
    }

    if (textSizeLine1Input) {
        textSizeLine1Input.addEventListener('input', (e) => {
            state.textSizeLine1 = parseInt(e.target.value, 10);
            textSizeLine1Val.textContent = state.textSizeLine1;
            markTextCacheDirty();
            renderCanvas();
        });
    }

    if (textSizeLine2Input) {
        textSizeLine2Input.addEventListener('input', (e) => {
            state.textSizeLine2 = parseInt(e.target.value, 10);
            textSizeLine2Val.textContent = state.textSizeLine2;
            markTextCacheDirty();
            renderCanvas();
        });
    }

    posYInput.addEventListener('input', (e) => {
        state.posY = parseInt(e.target.value, 10);
        posYVal.textContent = `${state.posY}%`;
        renderCanvas();
    });

    posXInput.addEventListener('input', (e) => {
        state.posX = parseInt(e.target.value, 10);
        posXVal.textContent = `${state.posX}%`;
        renderCanvas();
    });

    if (imgScaleInput) {
        imgScaleInput.addEventListener('input', (e) => {
            state.imgScale = parseInt(e.target.value, 10);
            imgScaleVal.textContent = `${state.imgScale}%`;
            renderCanvas();
        });
    }

    const letterboxToggle = document.getElementById('letterboxToggle');

    if (letterboxCheckbox) {
        letterboxCheckbox.addEventListener('change', (e) => {
            state.showLetterbox = e.target.checked;
            if (letterboxToggle) letterboxToggle.classList.toggle('is-active', state.showLetterbox);
            renderCanvas();
        });
    }

    if (brightenCheckbox) {
        brightenCheckbox.addEventListener('change', (e) => {
            state.showBrighten = e.target.checked;
            if (brightenToggle) brightenToggle.classList.toggle('is-active', state.showBrighten);
            renderCanvas();
        });
    }

    if (imgBrightnessInput) {
        imgBrightnessInput.addEventListener('input', (e) => {
            state.imgBrightness = parseInt(e.target.value, 10);
            if (imgBrightnessVal) imgBrightnessVal.textContent = `${state.imgBrightness}%`;

            // スライダー操作時は自動的に「明るさ調整」をONにする
            if (!state.showBrighten) {
                state.showBrighten = true;
                if (brightenCheckbox) brightenCheckbox.checked = true;
                if (brightenToggle) brightenToggle.classList.add('is-active');
            }

            renderCanvas();
        });
    }

    dragTargetRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                state.dragTarget = e.target.value;
            }
        });
    });

    resetBtn.addEventListener('click', () => {
        state.textSizeLine1 = 188;
        state.textSizeLine2 = 40;
        state.posX = 50;
        state.posY = 50;
        state.imgX = 0;
        state.imgY = 0;
        state.imgScale = 100;
        state.imgRotation = 0;
        state.showLetterbox = true;
        state.showBrighten = false;
        state.imgBrightness = 130;
        state.dragTarget = 'image';
        state.isCanvasLocked = false;

        if (letterboxCheckbox) letterboxCheckbox.checked = true;
        if (letterboxToggle) letterboxToggle.classList.add('is-active');
        if (brightenCheckbox) brightenCheckbox.checked = false;
        if (brightenToggle) brightenToggle.classList.remove('is-active');
        if (canvasLockCheckbox) canvasLockCheckbox.checked = false;
        if (canvasCard) canvasCard.classList.remove('canvas-locked');
        if (canvasLockToggle) canvasLockToggle.classList.remove('is-locked');

        dragTargetRadios.forEach(radio => {
            radio.checked = (radio.value === 'image');
        });

        if (textSizeLine1Input) {
            textSizeLine1Input.value = 188;
            textSizeLine1Val.textContent = '188';
        }
        if (textSizeLine2Input) {
            textSizeLine2Input.value = 40;
            textSizeLine2Val.textContent = '40';
        }
        posXInput.value = 50;
        posXVal.textContent = '50%';
        posYInput.value = 50;
        posYVal.textContent = '50%';
        if (imgScaleInput) {
            imgScaleInput.value = 100;
            imgScaleVal.textContent = '100%';
        }
        if (imgBrightnessInput) {
            imgBrightnessInput.value = 130;
            if (imgBrightnessVal) imgBrightnessVal.textContent = '130%';
        }

        validateAllInputs();
        showToast('設定をリセットしました');
    });

    // GIF Seekbar Animation Helper (3.5s loop)
    let gifAnimFrameId = null;
    let gifStartTime = null;

    function startGifSeekbarAnimation() {
        stopGifSeekbarAnimation();
        gifStartTime = performance.now();

        function update() {
            const now = performance.now();
            const elapsed = (now - gifStartTime) % 3500;
            const ratio = elapsed / 3500;

            if (gifSeekbarFill) {
                gifSeekbarFill.style.width = `${(ratio * 100).toFixed(1)}%`;
            }
            if (gifCurrentTime) {
                gifCurrentTime.textContent = `${(elapsed / 1000).toFixed(1)}s`;
            }

            gifAnimFrameId = requestAnimationFrame(update);
        }

        gifAnimFrameId = requestAnimationFrame(update);
    }

    function stopGifSeekbarAnimation() {
        if (gifAnimFrameId) {
            cancelAnimationFrame(gifAnimFrameId);
            gifAnimFrameId = null;
        }
    }

    // Helper: hide all modal steps and show the target one
    function showModalStep(stepEl) {
        if (stepEl !== shareStepGif) {
            stopGifSeekbarAnimation();
        }
        [shareStep1, shareStepGif].forEach(el => {
            if (el) el.style.display = 'none';
        });
        if (stepEl) stepEl.style.display = 'block';
    }

    // Generate Button & Modal Logic
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (isNgWordDetected) {
                showToast('エラーが発生しました');
                return;
            }

            renderCanvas();
            const dataUrl = canvas.toDataURL('image/png');
            shareImagePreview.src = dataUrl;

            const tweetText = encodeURIComponent(`「${state.textLine1}」のレース名カットを作成しました！\n#ウマ娘 #劇場版レース名メーカー\n`);
            const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
            twitterShareBtn.href = tweetUrl;

            showModalStep(shareStep1);
            shareModal.classList.add('open');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            stopGifSeekbarAnimation();
            shareModal.classList.remove('open');
        });
    }

    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            stopGifSeekbarAnimation();
            shareModal.classList.remove('open');
        }
    });

    if (downloadModalBtn) {
        downloadModalBtn.addEventListener('click', () => {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            const safeName = state.textLine1 ? state.textLine1.replace(/[\\/:*?"<>|]/g, '_') : 'race_title';
            link.download = `uma_race_${safeName}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('画像をダウンロードしました');
        });
    }

    if (copyImageBtn) {
        copyImageBtn.addEventListener('click', async () => {
            try {
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        showToast('画像のコピーに失敗しました');
                        return;
                    }
                    try {
                        const item = new ClipboardItem({ 'image/png': blob });
                        await navigator.clipboard.write([item]);
                        showToast('画像をクリップボードにコピーしました');
                    } catch (err) {
                        console.error('Clipboard write error:', err);
                        showToast('クリップボードへのコピーに対応していません');
                    }
                }, 'image/png');
            } catch (err) {
                console.error(err);
                showToast('クリップボードへのコピーに対応していません');
            }
        });
    }

    // GIF Animation Generation
    async function generateGif() {
        if (isNgWordDetected) {
            showToast('エラーが発生しました');
            return;
        }
        if (!state.textLine1) {
            showToast('1行目のレース名を入力してください');
            return;
        }
        if (typeof GIF === 'undefined') {
            showToast('GIFライブラリの読み込みに失敗しました');
            return;
        }

        // Revoke any previous GIF blob URL
        if (currentGifBlobUrl) {
            URL.revokeObjectURL(currentGifBlobUrl);
            currentGifBlobUrl = null;
        }
        if (gifPreview) gifPreview.src = '';

        // Open modal immediately in loading state
        if (gifModalTitle) gifModalTitle.textContent = 'GIFアニメを生成中...';
        if (gifLoadingState) gifLoadingState.style.display = 'flex';
        if (gifResultState) gifResultState.style.display = 'none';
        showModalStep(shareStepGif);
        shareModal.classList.add('open');

        generateGifBtn.disabled = true;

        try {
            // Fetch gif.js worker and create a Blob URL to bypass cross-origin Web Worker restrictions
            let workerUrl;
            try {
                const resp = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
                if (!resp.ok) throw new Error('network error');
                const workerText = await resp.text();
                const blob = new Blob([workerText], { type: 'application/javascript' });
                workerUrl = URL.createObjectURL(blob);
            } catch (e) {
                throw new Error('ワーカーの読み込みに失敗しました。ネットワーク接続を確認してください');
            }

            const origLine1 = state.textLine1;
            const origLine2 = state.textLine2;

            // Frame configuration: blank(1s) -> line1(0.5s) -> line1+line2(2s)
            const frameConfigs = [
                { showLine1: false, showLine2: false, delay: 1000 },
                { showLine1: true, showLine2: false, delay: 500 },
                { showLine1: true, showLine2: true, delay: 2000 },
            ];

            // Render each frame onto a same-size offscreen canvas (100% canvas resolution)
            const frameCanvases = [];
            for (const cfg of frameConfigs) {
                state.textLine1 = cfg.showLine1 ? origLine1 : '';
                state.textLine2 = cfg.showLine2 ? origLine2 : '';
                isTextCacheDirty = true;
                renderCanvas();

                const fc = document.createElement('canvas');
                fc.width = CANVAS_WIDTH;
                fc.height = CANVAS_HEIGHT;
                fc.getContext('2d').drawImage(canvas, 0, 0);
                frameCanvases.push({ canvas: fc, delay: cfg.delay });
            }

            // Restore original state and re-render the live preview
            state.textLine1 = origLine1;
            state.textLine2 = origLine2;
            isTextCacheDirty = true;
            renderCanvas();

            // Encode GIF
            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                workerScript: workerUrl,
                repeat: 0,
            });

            for (const frame of frameCanvases) {
                gif.addFrame(frame.canvas, { delay: frame.delay });
            }

            gif.on('finished', (blob) => {
                URL.revokeObjectURL(workerUrl);
                currentGifBlobUrl = URL.createObjectURL(blob);

                // Set tweet URL for share button
                const tweetText = encodeURIComponent(`「${origLine1}」のレース名カットGIFを作成しました！\n#ウマ娘 #劇場版レース名メーカー\n`);
                const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
                if (gifTwitterShareBtn) gifTwitterShareBtn.href = tweetUrl;

                // Switch modal to result state
                if (gifPreview) gifPreview.src = currentGifBlobUrl;
                if (gifModalTitle) gifModalTitle.textContent = 'GIFアニメが完成しました！';
                if (gifLoadingState) gifLoadingState.style.display = 'none';
                if (gifResultState) gifResultState.style.display = 'block';

                startGifSeekbarAnimation();
                generateGifBtn.disabled = false;
            });

            gif.on('error', (err) => {
                URL.revokeObjectURL(workerUrl);
                console.error('GIF error:', err);
                stopGifSeekbarAnimation();
                shareModal.classList.remove('open');
                generateGifBtn.disabled = false;
                showToast('GIF生成に失敗しました');
            });

            gif.render();

        } catch (err) {
            console.error('GIF generation failed:', err);
            stopGifSeekbarAnimation();
            shareModal.classList.remove('open');
            generateGifBtn.disabled = false;
            showToast(err.message || 'GIF生成に失敗しました');
        }
    }

    if (downloadGifBtn) {
        downloadGifBtn.addEventListener('click', () => {
            if (!currentGifBlobUrl) return;
            const link = document.createElement('a');
            const safeName = state.textLine1 ? state.textLine1.replace(/[\\/:*?"<>|]/g, '_') : 'race_title';
            link.download = `uma_race_${safeName}.gif`;
            link.href = currentGifBlobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('GIFアニメをダウンロードしました');
        });
    }

    if (closeGifModalBtn) {
        closeGifModalBtn.addEventListener('click', () => {
            stopGifSeekbarAnimation();
            shareModal.classList.remove('open');
        });
    }

    if (generateGifBtn) {
        generateGifBtn.addEventListener('click', generateGif);
    }

    // Initialize App & Async Data
    loadNgWords();
    loadRaceList();
    loadRacecourseList();

    if (document.fonts) {
        document.fonts.ready.then(() => {
            renderCanvasSafe(0);
        });
    }
});
