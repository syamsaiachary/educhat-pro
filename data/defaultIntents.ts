import { Intent } from '../types';

export const defaultIntents: Intent[] = [
  {
    id: '1',
    tag: 'greeting',
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'greetings'],
    responses: [
      "Hello! Welcome to EduChat. How can I assist you with your studies today?",
      "Hi there! I'm ready to help you learn.",
      "Greetings! What topic are we covering today?"
    ]
  },
  {
    id: '2',
    tag: 'goodbye',
    patterns: ['bye', 'goodbye', 'see you', 'later', 'exit'],
    responses: [
      "Goodbye! Happy learning!",
      "See you later. Don't forget to review your notes!",
      "Have a great day! Come back whenever you have questions."
    ]
  },
  {
    id: '3',
    tag: 'course_info',
    patterns: ['what courses are available', 'list courses', 'show me classes', 'what can I learn'],
    responses: [
      "We offer courses in Computer Science, Mathematics, Physics, and History. Which one interests you?",
      "Our current curriculum includes CS101, Math202, Physics101, and World History."
    ]
  },
  {
    id: '4',
    tag: 'enrollment',
    patterns: ['how to enroll', 'sign up', 'register for a class', 'join course'],
    responses: [
      "To enroll, please visit the student portal at portal.university.edu and click 'Register'.",
      "Enrollment is open! Navigate to the 'Admissions' tab on our main website."
    ]
  },
  {
    id: '5',
    tag: 'tuition',
    patterns: ['how much does it cost', 'tuition fees', 'price of courses', 'cost'],
    responses: [
      "Tuition is calculated per credit hour. Currently, it is $200 per credit.",
      "The standard semester fee is $2,500 for full-time students."
    ]
  },
  {
    id: '6',
    tag: 'library',
    patterns: ['where is the library', 'library hours', 'book access'],
    responses: [
      "The library is located in Building C. It is open from 8 AM to 10 PM daily.",
      "You can access digital resources 24/7 via the library website."
    ]
  },
  {
    id: '7',
    tag: 'help',
    patterns: ['help', 'i need assistance', 'support', 'what can you do'],
    responses: [
      "I can answer questions about courses, enrollment, tuition, and campus facilities. Try asking 'What courses do you have?'",
      "I am an educational assistant. Ask me about school policies, subjects, or schedules!"
    ]
  }
];