import { MultipleChoiceQuestionBank } from "./question_banks/multiple_choice.js";
import { saveQuizActivity } from './save.js';
import { alertPopup } from '../alert_popup.js';

let selectedQuestions = [];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomQuestion(topic) {
    const questions = MultipleChoiceQuestionBank[topic];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const shuffledQuestion = { ...randomQuestion }
    shuffledQuestion.options = shuffleArray([...randomQuestion.options]);
    return shuffledQuestion;
}

function generateQuiz() {
    document.getElementById('quiz-header').textContent = 'Kalkulukuizz: Multiple Choice!'
    document.getElementById('quiz-instruction').textContent = 'Answer the following questions to see how cool you are :3';

    document.getElementById('quiz-submit-button').style.display = 'block';
    document.getElementById('quiz-again-button').style.display = 'none';

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';

    const topics = shuffleArray(['limit', 'derivative', 'integral']);
    
    topics.forEach(topic => {
        const questionObj = getRandomQuestion(topic);
        selectedQuestions.push({ topic, question: questionObj });

        const topicDiv = document.createElement('div');
        topicDiv.classList.add('quiz-topic', `quiz-topic-${topic}`);

        const titleElement = document.createElement('h2');
        titleElement.classList.add('quiz-topic-title', `topic-${topic}-title`);
        titleElement.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('topic-content', `topic-${topic}-background`);

        const questionElement = document.createElement('p');
        questionElement.classList.add('quiz-question');
        questionElement.textContent = questionObj.question;

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('quiz-answer-options');
        questionObj.options.forEach((option, index) => {
            const label = document.createElement('label');
            label.classList.add('quiz-answer-option');

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `${topic}-q`;
            input.value = option;
            input.id = `${topic}-${index}`;

            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            optionsDiv.appendChild(label);
        });

        contentDiv.appendChild(questionElement);
        contentDiv.appendChild(optionsDiv);

        topicDiv.appendChild(titleElement);
        topicDiv.appendChild(contentDiv);
        quizContainer.appendChild(topicDiv);
    });
}

function submitQuiz() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const quizContainer = document.getElementById('quiz-container');

    let answered = 0;

    selectedQuestions.forEach(({ topic }) => {
        const selectedAnswer = document.querySelector(`input[name="${topic}-q"]:checked`);
        if(selectedAnswer) answered ++;
    }); 

    if(answered) {
        let score = 0;
        let questions = {};

        selectedQuestions.forEach(({ topic, question }) => {
            const quizTopicContainer = quizContainer.querySelector(`.quiz-topic.quiz-topic-${topic}`);
            const quizTopicContentContainer = quizTopicContainer.querySelector('.topic-content');

            const selectedAnswer = document.querySelector(`input[name="${topic}-q"]:checked`);
            const userAnswer = selectedAnswer ? selectedAnswer.value : "Not answered";
            const isCorrect = userAnswer === question.correctAnswer;

            if (isCorrect) {
                score ++;
            }

            questions[question.id] = {
                userAnswer: userAnswer,
                id: question.id
            };

            const allOptions = quizTopicContainer.querySelectorAll(`input[name="${topic}-q"]`);
            allOptions.forEach(option => {
                option.disabled = true;
            });

            const reviewQuestion = document.createElement('div');
            reviewQuestion.classList.add('quiz-review-question');

            const userAnswerElement = document.createElement('p');
            userAnswerElement.classList.add('quiz-review-answer', 'quiz-user-answer', isCorrect ? 'quiz-correct-answer' : 'quiz-incorrect-answer');
            userAnswerElement.textContent = userAnswer;
            reviewQuestion.appendChild(userAnswerElement);

            const correctAnswerElement = document.createElement('p');
            correctAnswerElement.classList.add('quiz-review-answer', 'quiz-correct-answer');
            correctAnswerElement.textContent = question.correctAnswer;
            reviewQuestion.appendChild(correctAnswerElement);

            quizTopicContentContainer.appendChild(reviewQuestion);
        });

        saveQuizActivity("multiple_choice", score, 3, questions );

        const resultText = `You got ${score} out of ${selectedQuestions.length} correct. Keep it up!`;

        document.getElementById('quiz-header').textContent = 'Congrats!';
        document.getElementById('quiz-instruction').textContent = resultText;

        document.getElementById('quiz-submit-button').style.display = 'none';
        document.getElementById('quiz-again-button').style.display = 'block';
    }
    else {
        alertPopup("Can not submit", "Please answer at least one question.")
    }
}


function resetQuiz() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';

    selectedQuestions = [];

    generateQuiz();
}

window.onload = generateQuiz;

document.getElementById('quiz-submit-button').addEventListener('click', submitQuiz);
document.getElementById('quiz-again-button').addEventListener('click', resetQuiz);
