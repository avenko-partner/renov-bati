from pathlib import Path
import json,sys
from PIL import ImageFont,features
root=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/workspace/sites/renov-bati-premium')
geometry=root/'documents/verification-geometrie-responsive-v16.json'
records=[]
for profile in json.loads(geometry.read_text())['records']:
 size=profile['hero_title_size']
 font=ImageFont.truetype(str(root/'dist/assets/fonts/font-6.ttf'),round(size*64))
 lines=[]
 for text in ['L’empreinte','de vos projets.']:
  width=font.getlength(text)/64-(len(text)-1)*.055*size
  lines.append({'text':text,'estimated_width':round(width,3),'available_width':round(profile['hero_title_width'],3),'fits':width<=profile['hero_title_width']})
 if not all(x['fits'] for x in lines):raise RuntimeError(str((profile,lines)))
 records.append({'width':profile['w'],'height':profile['h'],'reading_width':profile['reading_width'],'font_size':size,'lines':lines})
result={'status':'PASS','version':16,'date':'2026-10-13','profiles':len(records),'method':'Estimation des avances typographiques depuis le Manrope 400 local, à une échelle 64×, avec espacement de lettres de −0,055 em.','limits':['Pillow mesure les glyphes ; ce calcul ne remplace pas la composition dans un navigateur et ne vérifie pas tous les textes.','Le calcul compte les espacements entre caractères et conserve une marge conservatrice sur le dernier caractère.'],'raqm_available':features.check('raqm'),'records':records}
output=root/'documents/verification-typographie-responsive-v16.json'
output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS','typography_profiles':len(records),'output':str(output)}))
