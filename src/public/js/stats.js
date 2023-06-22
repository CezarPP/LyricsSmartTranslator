fetch('/api/translations', {
    method: 'GET'
})
    .then(response => {
        if (!response.ok) {
            throw new Error("Error getting response");
        }
        return response.json();
    })
    .then(data => {
        const sortedTranslations = data.sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            return timeA - timeB;
        });

        const times = sortedTranslations.map(translation => {
            const time = new Date(translation.time);
            const hours = Math.floor((time - new Date("2023-06-01")) / (1000 * 60 * 60));
            return hours;
        });
        const uniqueTimes = times.filter((time, index) => times.indexOf(time) === index);

        const nrOfTranslations = uniqueTimes.map(time => {
            let count = 0;
            for (let i = 0; i < sortedTranslations.length; i++) {
                const translationTime = new Date(sortedTranslations[i].time);
                const translationHours = Math.floor((translationTime - new Date("2023-06-01")) / (1000 * 60 * 60));
                if (translationHours <= time) {
                    count++;
                } else {
                    break;
                }
            }
            return count;
        });

        console.log(times);
        console.log(nrOfTranslations);

        const canvas = document.getElementById('myChart');
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: uniqueTimes,
                datasets: [{
                    label: 'Nr. of Translations',
                    data: nrOfTranslations,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (hours since 2023-06-01)',
                            font: {
                                weight: 'bold',
                                size: 16
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Total number of translations',
                            font: {
                                weight: 'bold',
                                size: 16
                            }
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => {
        console.log("Error: " + error);
    });
