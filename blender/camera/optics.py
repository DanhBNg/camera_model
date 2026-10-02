from geometry import *

def build():
    mount=group('mount',(.23,-.08,.64))
    ring(mount,'bayonet flange',.875,.635,.12,(0,0,0),'silver')
    ring(mount,'throat',.705,.605,.17,(0,0,.016),'black')
    for i in range(4):
        a=math.pi/4+i*math.pi/2;screw(mount,'mount screw',(math.cos(a)*.785,math.sin(a)*.785,.073))
    for i in range(3):
        a=i*math.tau/3
        rotate(box(mount,'bayonet tab',(.24,.10,.05),(.61*math.cos(a),.61*math.sin(a),.11),'brass',.01),'z',a+math.pi/2)
    cyl(mount,'registration dot',.027,.01,(0,.797,.077),'orange','z')
    lens=group('lens',(.23,-.08,.87))
    for n,ro,ri,d,z,mat in [('rear barrel',.691,.535,.39,.08,'dark'),('aperture collar',.742,.54,.115,.08,'edge'),('aperture index',.744,.54,.035,.155,'dark'),('distance scale',.735,.54,.15,.27,'dark'),('optical tube',.68,.537,.64,.4,'black'),('front barrel',.739,.543,.23,.65,'dark'),('filter rim',.766,.584,.07,.80,'edge'),('name ring',.723,.562,.035,.835,'black')]:ring(lens,n,ro,ri,d,(0,0,z),mat)
    ribs(lens,'aperture knurl',.747,.07,(0,0,.065),count=72)
    focus=group('focus-pivot',(0,0,0),lens)
    ring(focus,'focus ring',.767,.54,.26,(0,0,.46),'dark')
    ribs(focus,'focus grip',.771,.218,(0,0,.46),count=96,mat='dark')
    for z in [.326,.594]:ring(focus,'focus bright edge',.773,.748,.018,(0,0,z),'edge')
    for i in range(4):ring(lens,'filter thread',.593,.579,.008,(0,0,.785+i*.015),'edge')
    # Real mesh lettering follows the front annulus and stays sharp at close range.
    inscription='ATELIER  •  1:1.8 / 50  •  MULTICOATED  •  '
    for i,ch in enumerate(inscription):
        a=math.pi/2-i/len(inscription)*math.tau
        text(lens,f'rim letter {i:02}',ch,.058,(.652*math.cos(a),.652*math.sin(a),.858),angle=a-math.pi/2)
    for i,word in enumerate(['1.8','2.8','4','5.6','8','11','16']):
        a=(i-3)*.24
        # Upper visible surface of barrel: text faces upward.
        text(lens,'f stop '+word,word,.045,(math.sin(a)*.59,math.cos(a)*.737,.16),'ivory','top')
    for i,word in enumerate(['0.7','1','1.5','2','3','5','10','INF']):
        x=(i-3.5)*.123
        text(lens,'distance '+word,word,.039,(x,.731,.286),'ivory','top')
        box(lens,'scale tick',(.009,.007,.032),(x,.738,.235),'ivory',.001)
    box(lens,'focus index',(.018,.008,.09),(0,.747,.198),'orange',.002)
    glass=group('glass',(.23,-.08,1.60))
    # Convex and concave lens surfaces with closed thin edges.
    for idx,(r,z,sag,mat) in enumerate([(.548,.084,.044,'glass'),(.506,-.048,.026,'violet'),(.465,-.245,.035,'glass')]):
        profile=[]
        for i in range(17):
            rr=r*i/16;profile.append((rr,z+sag*(1-(rr/r)**2)))
        for i in reversed(range(17)):
            rr=r*i/16;profile.append((rr,z-.018+sag*.55*(1-(rr/r)**2)))
        lathe(glass,f'coated element {idx}',list(reversed(profile)),mat=mat,segments=96)
        ring(glass,f'element retaining ring {idx}',r+.018,r-.004,.025,(0,0,z-.012),'dark')
    iris=group('iris',(.23,-.08,1.25))
    ring(iris,'diaphragm chassis',.532,.45,.045,(0,0,0),'edge')
    # Nine overlapping curved-looking polygon blades leave a real central aperture.
    for i in range(9):
        a=i*math.tau/9
        poly=[]
        for r,t in [(.185,0),(.46,.12),(.485,.55),(.31,.88),(.185,.69)]:poly.append((r*math.cos(a+t),r*math.sin(a+t),.006+i*.0004))
        mesh(iris,f'iris blade {i}',poly,[(0,1,2,3,4)],'dark')
        cyl(iris,'iris pivot',.018,.012,(.463*math.cos(a),.463*math.sin(a),.015),'brass','z',24)
    finder=group('finder',(-.78,1.045,0))
    box(finder,'finder optical tunnel',(.44,.185,.91),(0,0,0),'black',.022)
    for z in [.623,-.662]:
        box(finder,'finder metal frame',(.52,.256,.063),(0,0,z),'edge',.034)
        box(finder,'finder inset',(.427,.184,.071),(0,0,z+(.009 if z>0 else -.009)),'black',.026)
        box(finder,'finder window',(.372,.145,.012),(0,0,z+(.052 if z>0 else -.052)),'optic',.019)
    box(finder,'rangefinder housing',(.245,.185,.33),(-.67,0,.46),'black',.025)
    box(finder,'rangefinder window',(.19,.125,.023),(-.67,0,.635),'glass',.018)
    for x in [-.11,.11]:box(finder,'brightline vertical',(.004,.07,.005),(x,0,-.724),'ivory',.001)
    for y in [-.038,.038]:box(finder,'brightline horizontal',(.22,.004,.005),(0,y,-.724),'ivory',.001)
