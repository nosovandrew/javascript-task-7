'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */

function runParallel(jobs, parallelNum, timeout = 1000) {
    let result = []; // массив с результатами
    let jobCounter = 0; // текущий элемент jobs
    let end = 0; // условие конца

    return new Promise((resolve) => {
        // проверяю, если jobs пуст, тогда возвращаю []
        if (jobs.length === 0) {
            resolve([]);
        }
        // создаю promise на каждый язык в jobs
        let promisesWithTimeout = jobs.map((job) => () =>
            new Promise((jobResolve, jobReject) => {
                job().then(jobResolve, jobReject);
                // если выремя дошло до timeout, тогда reject с ошибкой
                setTimeout(jobReject, timeout, new Error('Promise timeout'));
            })
        );
        // для каждого эл. в jobs вызывается обработчик
        function translator(job) {
            let handler = data => checker(data, jobCounter++);
            job().then(handler)
                .catch(handler);
        }
        // проверяет, когда можно закончить перевод
        function checker(data, index) {
            result[index] = data;
            end += 1;
            if (jobs.length === end) {
                resolve(result);
            }
            if (jobCounter < jobs.length) {
                translator(jobs[jobCounter]);
            }
        }
        // ограничение по колличеству промисов
        promisesWithTimeout.slice(0, parallelNum).forEach(job => translator(job));
    });
}
