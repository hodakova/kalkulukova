const MultipleChoiceQuestionBank = {
    limit: [
        {
            id: "ML1",
            question: "What is the limit of (x² - 1)/(x - 1) as x approaches 1?",
            options: ["0", "1", "2", "Does not exist"],
            correctAnswer: "2"
        },
        {
            id: "ML2",
            question: "What is the limit of sin(x)/x as x approaches 0?",
            options: ["0", "1", "∞", "Does not exist"],
            correctAnswer: "1"
        },
        {
            id: "ML3",
            question: "What is the limit of (1 + 1/n)ⁿ as n approaches 0?",
            options: ["e", "1", "∞", "Does not exist"],
            correctAnswer: "Does not exist"
        },
        {
            id: "ML4",
            question: "What is the limit of ln(x) as x approaches 0 from the positive side?",
            options: ["-∞", "∞", "0", "Does not exist"],
            correctAnswer: "-∞"
        }
    ],
    derivative: [
        {
            id: "MD1",
            question: "What is the derivative of f(x) = 3x²?",
            options: ["6x", "9x", "3x", "3"],
            correctAnswer: "6x"
        },
        {
            id: "MD2",
            question: "What is the derivative of f(x) = sin(x)?",
            options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
            correctAnswer: "cos(x)"
        },
        {
            id: "MD3",
            question: "What is the derivative of f(x) = eˣ?",
            options: ["eˣ", "x", "1", "xᵉ"],
            correctAnswer: "eˣ"
        },
        {
            id: "MD4",
            question: "What is the derivative of f(x) = 1/x?",
            options: ["1/x", "ln(x)", "eˣ", "-1/x²"],
            correctAnswer: "-1/x²"
        }
    ],
    integral: [
        {
            id: "MI1",
            question: "What is the integral of f(x) = 2x?",
            options: ["x²", "2x²", "x² + C", "2x² + C"],
            correctAnswer: "x² + C"
        },
        {
            id: "MI2",
            question: "What is the integral of f(x) = 1/x?",
            options: ["ln|x| + C", "1/x + C", "x + C", "x² + C"],
            correctAnswer: "ln|x| + C"
        },
        {
            id: "MI3",
            question: "What is the integral of f(x) = cos(x)?",
            options: ["sin(x) + C", "-sin(x) + C", "cos(x) + C", "-cos(x) + C"],
            correctAnswer: "sin(x) + C"
        },
        {
            id: "MI4",
            question: "What is the integral of f(x) = eˣ?",
            options: ["eˣ + C", "eˣ", "ln(x) + C", "xᵉ"],
            correctAnswer: "eˣ + C"
        }
    ]
}

export { MultipleChoiceQuestionBank }
