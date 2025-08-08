import matplotlib.pyplot as plt
from pycalphad import Database, ternplot
from pycalphad import variables as v


start = 500
end = 2500
i = 500
db_al_cu_y = Database('Al-Cu-Y.tdb')
comps = ['AL', 'CU', 'Y', 'VA']
phases = list(db_al_cu_y.phases.keys())

#This is the first slice, has all info
conds = {v.T: start, v.P:101325, v.X('AL'): (0,1,0.2), v.X('Y'): (0,1,0.2)}
fig, ax = plt.subplots(subplot_kw={'projection': 'triangular'}, figsize=(12,12))
fig.patch.set_alpha(0)
ax = ternplot(db_al_cu_y, comps, phases, conds, ax=ax)
ax.get_legend().remove()
ax.grid(False)
ax.patch.set_alpha(0)
#ax.xaxis.label.set_color('white')        #setting up X-axis label color to white
#ax.yaxis.label.set_color('white')          #setting up Y-axis label color to white
#ax.tick_params(axis='x', colors='white')
#ax.tick_params(axis='y', colors='white')    #setting up X-axis tick color to white
#ax.title.set_color('white')
#plt.savefig('Al-Cu-Y_'+str(start)+'.png')
plt.savefig('Al-Cu-Y_test.png')
#index to next slice
print(i)
#for loop for middle slices
for i in range(start+10, end, 10):
    conds = {v.T: i, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}
    fig, ax = plt.subplots(subplot_kw={'projection': 'triangular'}, figsize=(12,12))
    fig.patch.set_alpha(0)
    ax = ternplot(db_al_cu_y, comps, phases, conds, ax=ax)
    ax.set_title('')
    ax.axis('off')
    ax.get_legend().remove()
    ax.grid(False)
    ax.patch.set_alpha(0)
    plt.savefig('Al-Cu-Y_'+str(i)+'.png')
    print(i)
for i in range(start+100, end, 100):
    conds = {v.T: i, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}
    fig, ax = plt.subplots(subplot_kw={'projection': 'triangular'}, figsize=(12,12))
    fig.patch.set_alpha(0)
    ax = ternplot(db_al_cu_y, comps, phases, conds, ax=ax)
    ax.set_title(str(i)+'K')
    ax.set_yticklabels([])
    ax.set_xticklabels([])
    ax.set_xlabel('')
    ax.set_ylabel('')
    ax.get_legend().remove()
    ax.grid(False)
    ax.patch.set_alpha(0)
    ax.title.set_color('white')
    plt.savefig('Al-Cu-Y_'+str(i)+'.png')
    i = i + 100
    print(i)
conds = {v.T: end, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}
fig, ax = plt.subplots(subplot_kw={'projection': 'triangular'}, figsize=(12,12))
fig.patch.set_alpha(0)
ax = ternplot(db_al_cu_y, comps, phases, conds, ax=ax)
ax.set_title(i)
ax.set_yticklabels([])
ax.set_xticklabels([])
ax.set_xlabel('')
ax.set_ylabel('')
ax.get_legend().remove()
ax.patch.set_alpha(0)
ax.title.set_color('white')
ax.grid.set_color('white')
plt.savefig('Al-Cu-Y_'+str(end)+'.png')


print(i)