import matplotlib.pyplot as plt
from pycalphad import Database, ternplot
from pycalphad import variables as v


start = 500
end = 2350
i = 500
m = 0
db_al_cu_y = Database('Al-Cu-Y.tdb')
comps = ['AL', 'CU', 'Y', 'VA']
phases = list(db_al_cu_y.phases.keys())

#This is the first slice, has all info
conds = {v.T: start, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}
fig, ax = plt.subplots(subplot_kw={'projection': 'triangular'}, figsize=(12,12))
ax = ternplot(db_al_cu_y, comps, phases, conds, ax=ax, linewidth=20)
ax.get_legend().remove()
ax.grid(False)
fig.patch.set_facecolor('black')
ax.patch.set_facecolor('black')
ax.xaxis.label.set_color('white')        #setting up X-axis label color to yellow
ax.yaxis.label.set_color('white')          #setting up Y-axis label color to blue
ax.tick_params(axis='x', colors='white')
ax.tick_params(axis='y', colors='white')    #setting up X-axis tick color to red
ax.title.set_color('white')
#setting up Y-axis tick color to black
#ax.patch.set_facecolor('black')
plt.savefig('Al-Cu-Y_'+str(start)+'.png')
#plt.savefig('Al-Cu-Y_test.jpg')
#index to next slice
print(i)
#for loop for middle slices
for i in range(start+5, end, 5):
    conds = {v.T: i, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}
    fig, ax = plt.subplots(subplot_kw={'projection': 'triangular'}, figsize=(12,12))
    ax = ternplot(db_al_cu_y, comps, phases, conds, ax=ax)
    fig.patch.set_facecolor('black')
    ax.patch.set_facecolor('black')
    ax.set_title('')
    ax.axis('off')
    ax.get_legend().remove()
    ax.grid(False)
    plt.savefig('Al-Cu-Y_'+str(i)+'.png')
    print(i)
for i in range(start+100, end, 100):
    conds = {v.T: i, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}
    fig, ax = plt.subplots(subplot_kw={'projection': 'triangular'}, figsize=(12,12))
    ax = ternplot(db_al_cu_y, comps, phases, conds, ax=ax)
    fig.patch.set_facecolor('black')
    ax.patch.set_facecolor('black')
    ax.set_title('')
    ax.set_yticklabels([])
    ax.set_xticklabels([])
    ax.set_xlabel(str(i)+'K')
    ax.set_ylabel(str(i)+'K')
    ax.xaxis.label.set_color('white')  # setting up X-axis label color to yellow
    ax.yaxis.label.set_color('white')
    ax.get_legend().remove()
    ax.grid(False)
    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white')  # setting up X-axis tick color to red
    ax.title.set_color('white')
    plt.savefig('Al-Cu-Y_'+str(i)+'.png')
    i = i + 100
    print(i)
conds = {v.T: end, v.P:101325, v.X('AL'): (0,1,0.015), v.X('Y'): (0,1,0.015)}
fig, ax = plt.subplots(subplot_kw={'projection': 'triangular'}, figsize=(12,12))
ax = ternplot(db_al_cu_y, comps, phases, conds, ax=ax)
fig.patch.set_facecolor('black')
ax.patch.set_facecolor('black')
ax.set_title('')
ax.set_yticklabels([])
ax.set_xticklabels([])
ax.set_xlabel(str(end)+'K')
ax.set_ylabel(str(end)+'K')
ax.xaxis.label.set_color('white')        #setting up X-axis label color to yellow
ax.yaxis.label.set_color('white')
ax.get_legend().remove()
ax.tick_params(axis='x', colors='white')
ax.tick_params(axis='y', colors='white')    #setting up X-axis tick color to red
ax.title.set_color('white')
plt.savefig('Al-Cu-Y_'+str(end)+'.png')


print(i)