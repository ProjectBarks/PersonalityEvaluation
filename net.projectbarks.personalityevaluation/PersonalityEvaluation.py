from . import PersonalityEvaulationAPI as pea

__author__ = 'brandon'

if __name__ == '__main__':
    #from PersonalityEvaulationAPI import PersonalityEvaluationResult, fill_personality, evaluate_personality
    result = pea.PersonalityEvaluationResult()
    pea.fill_personality("I enjoy walking in the park. I like to eat candy. Sometimes I play with my Brother.", result)
    pea.fill_personality("My dog is very warm and fuzzy. I like cats. I like dogs more.", result)
    pea.evaluate_personality(result)
    print(vars(result))
    print(result.word_sentiment, result.word_value, result.words_pronoun)