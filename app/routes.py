from flask import render_template, flash, redirect, url_for
from app import app
from app.forms import FishingForm
from app.fishing_advice import generate_fishing_advice


@app.route('/', methods=['GET', 'POST'])
def index():
    form = FishingForm()
    advice = None
    if form.validate_on_submit():
        try:
            advice = generate_fishing_advice(form.data)
        except Exception as e:
            flash(f'生成建议时出错: {str(e)}', 'error')
    return render_template('index.html', form=form, advice=advice)
