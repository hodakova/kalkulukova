const fillInTheBlanksQuestionBank = {
    limit: [
        { 
            id: "FL1", 
            question: "lim x→0 (sin(x) / ....) = 1", 
            correctAnswer: ["x"] 
        },
        { 
            id: "FL2", 
            question: "lim x→∞ (1 + ....)ˣ = e", 
            correctAnswer: ["1/x"] 
        },
        { 
            id: "FL3", 
            question: "lim x→0 (1/x) = ....", 
            correctAnswer: ["does not exist", "doesn't exist"]
        }
    ],
    derivative: [
        { 
            id: "FD1", 
            question: "d/dx (....) = cos(x)", 
            correctAnswer: ["sin(x)"] 
        },
        { 
            id: "FD2", 
            question: "d/dx (eˣ) = ....", 
            correctAnswer: ["eˣ", "e^x"] 
        },
        { 
            id: "FD3", 
            question: "d/dx (2x³) = ....", 
            correctAnswer: ["6x²", "6x^2"]
        }
    ],
    integral: [
        { 
            id: "FI1", 
            question: "∫ .... dx = ln|x| + C", 
            correctAnswer: ["1/x"] 
        },
        { 
            id: "FI2", 
            question: "∫ sin(x) dx = .... + C", 
            correctAnswer: ["-cos(x)"] 
        },
        { 
            id: "FI3", 
            question: "∫ 3x² dx = .... + C", 
            correctAnswer: ["x³", "x^3"]
        }
    ]
}

export { fillInTheBlanksQuestionBank }
