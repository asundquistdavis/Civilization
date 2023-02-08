
def get_or_create(Model, **kwargs)->object:
    if 'id' in kwargs.keys():
        model = Model(**kwargs)
        model.save()
    else:
        try:
            model = Model.objects.filter(**kwargs)[0]
        except IndexError:
            model = Model.objects.create(**kwargs)
    return model
