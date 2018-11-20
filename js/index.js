function calcBackgroundFlow(system) {
    let model = system.model;
    let input = system.input;

    //wrong last element what a P?
    let min = Math.min(...
        [1 / (2 * input.tk),
        model.c / (model.beta * input.tcp),
        1 / (input.td * model.beta * model.p)]);

    system.result.lf = input.k1 * min * (model.n - 1) / model.n;
}

function calcT(system) {
    let model = system.model;
    let input = system.input;
    let result = system.result;

    result.Tk = 2 * input.tk / (1 - result.lf * input.tk);
    result.Tcp = model.beta * input.tcp / Math.pow((1 - model.beta * result.lf * input.tcp / model.c), model.c);
    result.Td = model.beta * input.td / (1 - input.td * model.beta * result.lf * model.p);
    result.Tc = result.Tk + result.Tcp + result.Td + input.Tdob + input.Tf;
}

function calcNewLf(system) {
    let model = system.model;
    let input = system.input;
    let result = system.result;
    let lfnew = (model.n - 1) / result.Tc;

    let buf = Math.abs(result.lf - lfnew) / lfnew;

    if (buf < input.delta)
        return true;

    result.lf -= Math.abs(result.lf - lfnew) / input.k2;
    return false;
}

function calcResultState(system) {
    let model = system.model;
    let input = system.input;
    let result = system.result;

    result.Tp = result.Tc - input.Tf;
    result.l = model.n / result.Tc;
    result.Pk = 2 * result.l * input.tk;
    result.Pcp = (model.beta * result.l * input.tcp) / model.c;
    result.Pd = model.p * model.beta * result.l * input.td;
    result.Pcy = (input.Tdob + input.Tf) / result.Tc;
    result.Ppl = input.Tf / result.Tc;
}

function System() {
    this.result = {
        //фоновый поток
        lf: 0.0,
        //входно поток
        l: 0.0,
        //хз
        Tp: 0.0,
        //t обработки и t в очереди для канала
        Tk: 0.0,
        //t обработки и t в очереди для процессора
        Tcp: 0.0,
        //t обработки и t в очереди для дисков
        Td: 0.0,
        //t обработки и t в очереди для цикла
        Tc: 0.0,
        //число итераций
        u: 0,
        //загрузка канала
        Pk: 0.0,
        //загрузка цп
        Pcp: 0.0,
        //загрузка диска
        Pd: 0.0,
        //загрузка с/я
        Pcy: 0.0,
        //загрузка п/ля
        Ppl: 0.0,
    };

    this.model = {
        //число процов
        n: 0,
        //хз
        c: 0,
        //1/(1 - gamma)
        beta: 0.0,
        //число дисков
        m: 0.0,
        //вреоятность выбора диска
        p: 0.0,
    };

    this.input = {
        k1: 0.0,
        k2: 0.0,
        delta: 0.0,
        tk: 0.0,
        td: 0.0,
        tcp: 0.0,
        Tdob: 0.0,
        Tf: 0.0,
    }

    this.calcBackgroundFlow = () => {
        calcBackgroundFlow(this);
    };

    this.calcT = () => {
        calcT(this);
    };

    this.calcNewLf = () => {
        return calcNewLf(this);
    };

    this.calcResultState = () => {
        calcResultState(this);
    };

    this.resultToFix = (num) => {
        resultToFix(this, num);
    };

    this.calcSystem = () => {
        this.calcBackgroundFlow();
        this.calcT();

        while (!this.calcNewLf()) {
            this.calcT();
            this.result.u++;

            if (this.result.u >= 100000) {
                alert("число итерация больше 100000 возможно ввели неверные данные");
                return;
            }
        }

        this.calcResultState();
    }
}

function parseInputToFloat(val) {
    if (typeof val === "string")
        val = val.replace(' ', '.').replace(',', '.')

    return parseFloat(val)
}

function resultToFix(system, num) {
    //фоновый поток
    system.result.lf = system.result.lf.toFixed(num);
    //входно поток
    system.result.l = system.result.l.toFixed(num);
    //хз
    system.result.Tp = system.result.Tp.toFixed(num);
    //t обработки и t в очереди для канала
    system.result.Tk = system.result.Tk.toFixed(num);
    //t обработки и t в очереди для процессора
    system.result.Tcp = system.result.Tcp.toFixed(num);
    //t обработки и t в очереди для дисков
    system.result.Td = system.result.Td.toFixed(num);
    //t обработки и t в очереди для цикла
    system.result.Tc = system.result.Tc.toFixed(num);
    //число итераций
    system.result.u = system.result.u.toFixed(num);
    //загрузка канала
    system.result.Pk = system.result.Pk.toFixed(num);
    //загрузка цп
    system.result.Pcp = system.result.Pcp.toFixed(num);
    //загрузка диска
    system.result.Pd = system.result.Pd.toFixed(num);
    //загрузка с/я
    system.result.Pcy = system.result.Pcy.toFixed(num);
    //загрузка п/ля
    system.result.Ppl = system.result.Ppl.toFixed(num);
}

function calcSystemResult(k1, k2, delta, n, tk, tcp, td, c, m, gamma, Tdob, Tf) {
    system = new System();

    system.input.delta = parseInputToFloat(delta);
    system.input.Tdob = parseInputToFloat(Tdob);
    system.input.tcp = parseInputToFloat(tcp);
    system.input.tk = parseInputToFloat(tk);
    system.input.td = parseInputToFloat(td);
    system.input.k1 = parseInputToFloat(k1);
    system.input.k2 = parseInputToFloat(k2);
    system.input.Tf = parseInputToFloat(Tf);

    system.model.beta = 1 / (1 - parseInputToFloat(gamma));
    system.model.m = parseInputToFloat(m);
    system.model.p = 1.0 / parseInt(m);
    system.model.c = parseInt(c);
    system.model.n = parseInt(n);

    let count = document.getElementById("inputCount").value;

    system.calcSystem();
    system.resultToFix(count);
    return system.result;
}

function readInput() {
    let input = {
        k1: document.getElementById("inputK1").value,
        k2: document.getElementById("inputK2").value,
        delta: document.getElementById("inputDelta").value,
        n: document.getElementById("inputN").value,
        tk: document.getElementById("inputtk").value,
        tcp: document.getElementById("inputtcp").value,
        td: document.getElementById("inputtd").value,
        c: document.getElementById("inputC").value,
        m: document.getElementById("inputM").value,
        gamma: document.getElementById("inputGamma").value,
        Tdob: document.getElementById("inputTdob").value,
        Tf: document.getElementById("inputTf").value,
    }

    return input;
}

function createResultField(text) {
    let p = document.createElement('p');
    p.innerHTML = text;
    return p;
}

function printResult(result) {
    let resultDiv = document.getElementById("resultDiv");
    while (resultDiv.firstChild)
        resultDiv.removeChild(resultDiv.firstChild);

    resultDiv.hidden = false;

    resultDiv.appendChild(createResultField(`Загрузка рабочей станции: ${result.Pcy}`));
    resultDiv.appendChild(createResultField(`Загрузка пользователя: ${result.Ppl}`));
    resultDiv.appendChild(createResultField(`Загрузка канала: ${result.Pk}`));
    resultDiv.appendChild(createResultField(`Загрузка процессора: ${result.Pcp}`));
    resultDiv.appendChild(createResultField(`Загрузка дисков: ${result.Pd}`));
    resultDiv.appendChild(createResultField(`Среднее время цикла системы Tц: ${result.Tc} с`));
    resultDiv.appendChild(createResultField(`Среднее время реакции Tp: ${result.Tp} с`));
    resultDiv.appendChild(createResultField(`Начальная эффективность фонового потока λ: ${result.l}`));
    resultDiv.appendChild(createResultField(`Конечная эффективность фонового потока λф: ${result.lf}`));
    resultDiv.appendChild(createResultField(`Число итераций: ${result.u}`));
    resultDiv.appendChild(createResultField(`Tk: ${result.Tk} с`));
    resultDiv.appendChild(createResultField(`Tцп: ${result.Tcp} с`));
    resultDiv.appendChild(createResultField(`Tдиск: ${result.Td} с`));
}

function startCalculations() {
    let input = readInput();

    let result = calcSystemResult(
        input.k1,
        input.k2,
        input.delta,
        input.n,
        input.tk,
        input.tcp,
        input.td,
        input.c,
        input.m,
        input.gamma,
        input.Tdob,
        input.Tf,
        input.count,
    );

    printResult(result);
}