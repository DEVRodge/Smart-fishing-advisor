from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, SubmitField
from wtforms.validators import DataRequired

class FishingForm(FlaskForm):
    location = StringField('钓点位置', validators=[DataRequired()])
    water_depth = StringField('水域深度', validators=[DataRequired()])
    target_fish = SelectField('目标鱼种', choices=[
        ('bass', '鲈鱼'), ('carp', '鲤鱼'), ('catfish', '鲶鱼'),
        ('trout', '鳟鱼'), ('snakehead', '黑鱼'), ('other', '其他')
    ], validators=[DataRequired()])
    water_condition = SelectField('实时水况', choices=[
        ('clear', '清澈'), ('muddy', '浑浊'), ('fastFlow', '快速流动'),
        ('slowFlow', '缓慢流动'), ('stagnant', '静止')
    ], validators=[DataRequired()])
    weather = SelectField('气象数据', choices=[
        ('sunny', '晴天'), ('cloudy', '多云'), ('rainy', '雨天'),
        ('windy', '大风'), ('overcast', '阴天')
    ], validators=[DataRequired()])
    pressure = StringField('气压信息', validators=[DataRequired()])
    time_of_day = SelectField('垂钓时段', choices=[
        ('dawn', '黎明'), ('morning', '清晨'), ('noon', '正午'),
        ('afternoon', '午后'), ('dusk', '黄昏'), ('night', '夜晚')
    ], validators=[DataRequired()])
    submit = SubmitField('生成钓鱼建议')

