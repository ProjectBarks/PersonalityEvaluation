from textblob import TextBlob
from textblob.sentiments import NaiveBayesAnalyzer
from nltk.corpus import wordnet as wn

__author__ = 'brandon'


class PersonalityEvaluationResult:
    __author__ = "brandon"
    word_value = {}
    word_sentiment = {}
    words_pronoun = {}
    cached_synsets = {}
    result = {}

    def add(self, phrases, sentiment):
        for i, v in enumerate(phrases):
            if v in self.word_value:
                self.word_value[v] += 1
            else:
                self.word_value[v] = 1
            if v in self.word_sentiment:
                self.word_sentiment[v] += sentiment
            else:
                self.word_sentiment[v] = sentiment

    def set_pronouns(self, elements):
        word_pronoun = elements

    def find_synsets(self, str):
        if str not in self.cached_synsets:
            synsets = wn.synsets(str)
            if (len(synsets) <= 0):
                return None;
            synsets = synsets[0]
            self.cached_synsets[str] = synsets
            return synsets
        return self.cached_synsets[str]


def trim(string):
    pos = 0
    for i, v in enumerate(string):
        if v != '.':
            continue
        pos = i
        break
    return string[:pos].lstrip()


def build_noun_phrases(string):
    noun_phrases = []
    pronoun_phrases = []
    builder = ''
    state = 'nil'
    for i, v in enumerate(string.pos_tags):
        if 'NN' in v[1]:
            if state == 'nil':
                state = ['p', 'n']['NNP' in v[1]]
            builder += " " + v[0]
        elif len(builder) > 0:
            phrases = ([pronoun_phrases, noun_phrases][state == 'p'])
            phrases.append(builder.lstrip())
            state = 'nil'
            builder = ""
    if len(builder) > 0:
        phrases = ([pronoun_phrases, noun_phrases][state == 'p'])
        phrases.append(builder.lstrip())
    return pronoun_phrases, noun_phrases


def fill_personality(string, personality):
    testimonial = TextBlob(string, analyzer=NaiveBayesAnalyzer())
    pronoun_phrases, noun_phrases = build_noun_phrases(testimonial)
    personality.add(noun_phrases, testimonial.sentiment.p_pos)
    personality.set_pronouns(pronoun_phrases)
    return personality


def add_value(evaluator, key, key_key, value):
    if key in evaluator:
        evaluator[key][key_key] = evaluator[key].get(key_key, 0.0) + value
    else:
        evaluator[key] = {key_key: value}
    return evaluator


def find_highest_key(collection):
    winner = None
    last_score = -1
    for i, f in enumerate(collection):
        if collection[f] < last_score:
            continue
        winner = f[0]
        last_score = collection[f]
    return winner


def evaluate_personality(personality):
    evaluator = {}
    for i, f in enumerate(personality.word_value):
        for ii, r in enumerate(personality.word_value):
            if (r in evaluator and f in evaluator[r]) or r == f: continue
            r_synsets, f_synsets = personality.find_synsets(r), personality.find_synsets(f)
            if r_synsets is None or f_synsets is None: continue
            value = f_synsets.wup_similarity(r_synsets)
            evaluator = add_value(evaluator, f, r, value)
            evaluator = add_value(evaluator, r, f, value)
    print(evaluator)
    for i, f in enumerate(evaluator):
        values = evaluator[f]
        print(values)
        highest_key = find_highest_key(values)
        if highest_key is None: continue
        common = personality.find_synsets(f).lowest_common_hypernyms(highest_key)
        personality = personality.result.get(common, {'sentiment':0, 'usage':0, 'words': []})
        personality.results[common]['words'] += highest_key, f
        personality.results[common]['usage'] += personality.word_value[highest_key]
        personality.results[common]['usage'] += personality.word_value[f]
        personality.results[common]['sentiment'] += personality.word_sentiment[highest_key]
        personality.results[common]['sentiment'] += personality.word_sentiment[f]
    print(personality.results)



if __name__ == '__main__':
    result = PersonalityEvaluationResult()
    fill_personality("I enjoy walking in the park. I like to eat candy. Sometimes I play with my Brother.", result)
    fill_personality("My dog is very warm and fuzzy. I like cats. I like dogs more.", result)
    evaluate_personality(result)
    print(vars(result))
    print(result.word_sentiment, result.word_value, result.words_pronoun)