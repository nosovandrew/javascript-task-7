'use strict';

exports.isStar = false;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */

function runParallel(jobs, parallelNum) {
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
            new Promise((_resolve, reject) => {
                job().then(_resolve, reject);
            })
        );
        // для каждого эл. в jobs вызывается обработчик
        function translator(job) {
            let i = jobCounter++;
            let handler = function (data) {
                checker(data, i);
            };
            job().then(handler);
        }
        // проверяет, когда можно закончить перевод
        function checker(data, index) {
            result[index] = data;
            end = end + 1;
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
