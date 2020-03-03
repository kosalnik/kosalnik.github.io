console.log(1);

var classes = {
    playItem: 'play-item'
}

var words = [
    [['Where'], ['Где', 'Куда']],
    [['Who'], ['Кто']],
    [['Why'], ['Почему', 'Зачем']],
    [['When'], ['Когда']],
    [['What'], ['Что', 'Какой']],
    [['How'], ['Как', 'Каким образом']],
    [['This'], ['Этот']],
    [['These'], ['Эти']],
    [['That'], ['Тот']],
    [['Those'], ['Те']],
]

var allWords = words
    .reduce(function (res, val) {
        val[0].map(function (item) {
            res[item] = val[1];
        });
        val[1].map(function (item) {
            res[item] = val[0];
        });
        return res;
    }, []);

var ScoreManager = function (opts) {
    var defaultOptions = {
        score: 0,
        onChange: false
    };

    opts = $.extend(defaultOptions, opts || {});

    this.getScore = function () {
        return score;
    }

    this.setScore = function (val) {
        score = val;
        if (typeof opts.onChange === 'function') {
            opts.onChange(score);
        }
    }

    this.setScore(opts.score || 0);
}

var WorkplaceManager = function (opts) {
    var initGround = '<div class="place place-left"></div><div class="place place-right"></div>';

    var defaultOptions = {

    };

    opts = $.extend(defaultOptions, opts || {});

    function createItem(body, draggable) {
        var item = $('<div/>')
            .addClass(classes.playItem)
            .text(body)
            .data('text', body);

        return item;
    }

    this.clear = function () {
        $('#ground').html(initGround);
        placeLeft = $('.place-left');
        placeRight = $('.place-right');
    }

    this.addLeft = function (text, cb) {
        var item = createItem(text);

        item.appendTo(placeLeft);

        if (typeof cb === 'function') cb(item);
    }

    this.addRight = function (text, cb) {
        var item = createItem(text);

        item.appendTo(placeRight);

        if (typeof cb === 'function') cb(item);
    }

    this.shadow = function (cb) {
        var layer = $('<div class="shadow"></div><div class="success"><div class="success-text">Кликни чтобы продолжить</div></div>');

        layer.appendTo($('#ground'));

        if (typeof cb === 'function') cb(layer);
    }
}

var Game = function(){
    var currentAnswer = null,
        game = this;

    function check(selectedAnswer)
    {
        var sel = typeof selectedAnswer.data === 'function' ? selectedAnswer.data('text') : selectedAnswer,
            question = typeof currentAnswer.data === 'function' ? currentAnswer.data('text') : currentAnswer;

        return allWords[sel].indexOf(question) > -1;
    }

    function success() {
        workplace.shadow(function (layer) {
            layer.on('click', function () {
                game.start();
            });
        })
    }

    function rnd(arr)
    {
        return arr[Math.round(Math.random() * (arr.length - 1))];
    }

    function shuffle(arr)
    {
        var res = [];
        while(arr.length > 0) {
            res.push(arr.splice(Math.round(Math.random() * (arr.length - 1)), 1)[0]);
        }
        arr = res;
        return res;
    }

    function newTask(various)
    {
        var row = Math.round(Math.random() * (words.length - 1)),
            answerLang = Math.round(Math.random()),
            variants = words.reduce(function (res, val){return res.concat(val[1 - answerLang]);},[]),
            taskWord = words[row][answerLang],
            answerWord = words[row][1 - answerLang];

        various = various || 20;

        taskWord = rnd(taskWord);
        answerWord = rnd(answerWord);

        variants.splice(variants.indexOf(answerWord), 1);

        do {
            variants.splice(Math.round(Math.random() * (variants.length - 1)), 1);
        } while (variants.length >= various);

        variants.push(answerWord);

        return {
            'task': taskWord,
            'variants': shuffle(variants)
        };
    }

    var scoreManager = new ScoreManager();
    var workplace = new WorkplaceManager();

    this.start = function () {
        var task = newTask();

        workplace.clear();

        currentAnswer = task.task;

        workplace.addLeft(task.task);

        task.variants.map(function (val) {
            workplace.addRight(val, function (item) {
                item.click(function () {
                    var ok = check($(this));

                    $(this).css({
                        background: check($(this)) ? '#99ffcc' : '#ffcccc'
                    });

                    if (ok) {
                        success();
                    }
                })
            });
        })
    }

    return {
        start: this.start,
        'new': newTask,
        scoreManager: scoreManager,
        workplace: workplace
    }
}

var game = new Game();
game.start();
