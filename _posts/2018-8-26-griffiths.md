---
layout: post
title: Nonparametric Latent Feature Models for Link Prediction
---

This paper is from the ML group in Berkeley.
There is quite a lot of material in non-parametric bayesian;
the reason that I'm going to spend a little bit of time on writing this is because of it's magic approach towards inferring the number of classes at the same time as associating the entities to each class.
I'll wrap up on details later but first I'm going to give enough background for you to follow what is going on in the paper.
From a classical point of view a link prediction task is meant to be defined by a number of edges and a set of nodes where ultimately we aim to predict new possible edgs between nodes.

In ML community it's common to use latent class models to learn latent classes in data as well as associating each node to a number of them.
This apparently simple problem turns out to be very complicated if the number of classes is unknown before observing data. 
Let's say <img alt="$s_1=$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/e63d5448ef61e2fd17edd20e83eeed26.svg?invert_in_darkmode" align="middle" width="32.355015pt" height="14.10255pt" style="position:relative;top:10px"/>'male high school athletes' and <img alt="$s_2=$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/caa80954b35018e0be0ea8d2119017fd.svg?invert_in_darkmode" align="middle" width="32.355015pt" height="14.10255pt" style="position:relative;top:10px"/>'male high school musician'. 
You have to be able to assign a single class <img alt="$c=$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/3318bc78ce112b6761f73b9288905746.svg?invert_in_darkmode" align="middle" width="24.39096pt" height="14.10255pt" style="position:relative;top:10px"/>'high school students' for these examples but through a flow of data you might find this reasonable to split it into two classes <img alt="$c_1=$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/b5cbeca3815c7e70bd9ff3164e0e51ee.svg?invert_in_darkmode" align="middle" width="31.76547pt" height="14.10255pt" style="position:relative;top:10px"/>'athlete' and <img alt="$c_2=$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/3367c6d79b877c913dccd683f3951fb9.svg?invert_in_darkmode" align="middle" width="31.76547pt" height="14.10255pt" style="position:relative;top:10px"/>'music'. 

Assume <img alt="$y_{ij}=1$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/193959917d5e875406dd5eab26c8139e.svg?invert_in_darkmode" align="middle" width="49.665pt" height="21.10812pt" style="position:relative;top:10px"/> if there is a link between entity <img alt="$i$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/77a3b857d53fb44e33b53e4c8b68351a.svg?invert_in_darkmode" align="middle" width="5.642109pt" height="21.60213pt" style="position:relative;top:10px"/> and <img alt="$j$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/36b5afebdba34564d884d347484ac0c7.svg?invert_in_darkmode" align="middle" width="7.6816575pt" height="21.60213pt" style="position:relative;top:10px"/> and <img alt="$y_{i,j}=0$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/67e3ad425f262d5d43ef11d4da43e404.svg?invert_in_darkmode" align="middle" width="53.569065pt" height="21.10812pt" style="position:relative;top:10px"/> if not. 
Lets define <img alt="$Z=[z_{i,j}]\in \{0,1\}^{N\times K}$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/859d4e2097e2da22e1254770851ac6e3.svg?invert_in_darkmode" align="middle" width="160.164345pt" height="27.59823pt" style="position:relative;top:10px"/> the feature value matrix for all examples and <img alt="$W=[w_{i,j}] \in R^{K\times K}$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/daa1032b51643b282c7bcad307157bbf.svg?invert_in_darkmode" align="middle" width="142.389885pt" height="27.59823pt" style="position:relative;top:10px"/> the weight matrix.
What a binary feature matrix <img alt="$Z$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/5b51bd2e6f329245d425b8002d7cf942.svg?invert_in_darkmode" align="middle" width="12.351075pt" height="22.38192pt" style="position:relative;top:10px"/> does is to represent data by presence/absence of hidden classes instead of continuous representation.
<p align="center"><img alt="\begin{equation*}&#10;P(Y|Z,W) = \Pi_{i,j} \Bigg[ P(y_{ij}| Z_i, Z_j,W) = \sigma \big ( Z_i W Z_j^T\big) = \sigma \big( \sum_{k,k'} z_{ik}z_{jk'}w_{kk'}\big) \Bigg ]&#10;\end{equation*}" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/955edbc0b2eb83e8fc2d93a66ca13a71.svg?invert_in_darkmode" align="middle" width="523.52355pt" height="50.765715pt" style="position:relative;top:10px"/></p>

If I unpack the definition of this function, the <img alt="$y_{i,j}$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/782a78d8c11a2145d873d3bc48870864.svg?invert_in_darkmode" align="middle" width="22.634205pt" height="14.10255pt" style="position:relative;top:10px"/> can purely be rendered by the feature vectors and the weights where <img alt="$\sigma = \frac{1}{1+\exp (-x)}$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/9eaa22a843a8020f1a347b764412b390.svg?invert_in_darkmode" align="middle" width="98.448075pt" height="27.72033pt" style="position:relative;top:10px"/>.
We don't need to invoke very complicated ideas to estimate <img alt="$P(Y|Z,W)$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/e1ce5fa1d74b30b52d79c04d7177e556.svg?invert_in_darkmode" align="middle" width="79.726185pt" height="24.56553pt" style="position:relative;top:10px"/> but we are about to assume the following priors:
<p align="center"><img alt="\begin{equation*}&#10;Z \sim IBP(\alpha) &#10;\end{equation*}" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/18c63f10b9a4ddca28b1e6bc16712caf.svg?invert_in_darkmode" align="middle" width="92.033205pt" height="16.376943pt" style="position:relative;top:10px"/></p>
<p align="center"><img alt="\begin{equation*}&#10;w_{kk'} \sim N(0,\delta^2_w) &#10;\end{equation*}" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/4a56963c4a4f9bfe3637530d80b56ac5.svg?invert_in_darkmode" align="middle" width="114.4803pt" height="18.269295pt" style="position:relative;top:10px"/></p>
<p align="center"><img alt="\begin{equation*}&#10;y_{ij} \sim \delta(Z_iWZ_j^T)&#10;\end{equation*}" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/5568287b2ca605e21e193a3d04493aea.svg?invert_in_darkmode" align="middle" width="119.228505pt" height="20.913915pt" style="position:relative;top:10px"/></p>

<img alt="$IBP(.)$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/cf8b75d677c758fa8caf59ef55c91a57.svg?invert_in_darkmode" align="middle" width="51.820065pt" height="24.56553pt" style="position:relative;top:10px"/> is the indian buffette process and explaining it gives huge amount of insight into this problem.
Let's assume the classes/features as a number of dishes and each customer is assumed to stop by a dish to fill her plate. 
This distribution has a set of very nice properties in particular it captures countable infinite number of classes.
We really don't want our prior somehow magically depends on the size of data.
So the first customer stops by Poisson<img alt="$(\alpha)$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/38f17d4708f8ad119c90e54b43954d60.svg?invert_in_darkmode" align="middle" width="23.2749pt" height="24.56553pt" style="position:relative;top:10px"/> number of dishes and the <img alt="$i-$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/7b7ccf0dc7f33e23877ead84bb57af55.svg?invert_in_darkmode" align="middle" width="18.379845pt" height="21.60213pt" style="position:relative;top:10px"/>th one take a look at the previously chosen ones based on their popularity and then chooses a new one by Poisson<img alt="$(\alpha/i)$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/a4ad10c795082c8b01669762c3919e17.svg?invert_in_darkmode" align="middle" width="37.10553pt" height="24.56553pt" style="position:relative;top:10px"/>.
We are going to take the limit of this as <img alt="$i$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/77a3b857d53fb44e33b53e4c8b68351a.svg?invert_in_darkmode" align="middle" width="5.642109pt" height="21.60213pt" style="position:relative;top:10px"/> goes to <img alt="$\infinity$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/e0c07b834cc98cd01db854cdce833d2d.svg?invert_in_darkmode" align="middle" width="8.1885045pt" height="14.10255pt" style="position:relative;top:10px"/>.
This is really cool and really strightforward. 

We need to have data to be able to infere these parameters:
<p align="center"><img alt="\begin{equation*}&#10; P(y_{ij}| Z,W,X,\beta) = \sigma \big ( Z_i W Z_j^T + \beta^T X_{ij} \big) &#10;\end{equation*}" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/6170744f6ba3a56c8f93a068152b977b.svg?invert_in_darkmode" align="middle" width="291.73155pt" height="20.913915pt" style="position:relative;top:10px"/></p>

it takes you to compute <img alt="$X_{i,j} = \exp (-d(i,j))$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/21307b65cad84cae9442087ddc854d77.svg?invert_in_darkmode" align="middle" width="143.386485pt" height="24.56553pt" style="position:relative;top:10px"/> which is a scalar similarity metric. 
Therefor from a practical point of view in each step of a sampling process the two most similar nodes should tend to get a link between them. 

This is certainly true based around a generative process but how do we generate these samples.
They proposed an approximate inference via MCMC:
<p align="center"><img alt="\begin{equations*}&#10;P(z_{ik}=1| Z_{-ik},W,Y) \propto P(Y|z_{ik}=1,Z_{-ik},W)&#10;\end{equations*}" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/2c2ca4e05835e160ee94bab2c00b3772.svg?invert_in_darkmode" align="middle" width="337.4976pt" height="16.376943pt" style="position:relative;top:10px"/></p> 
Just to give you an intuition, the MCMC Gibbs sampling is a method starts with random initialization; 
to be more precise <img alt="$Z_{-ik}$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/5e106c28ccbc3936410489fe9da8d97a.svg?invert_in_darkmode" align="middle" width="33.287595pt" height="22.38192pt" style="position:relative;top:10px"/> is supposed to be able to render the future independant of past.
To be more precise, removing <img alt="$z_{ik}$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/e444b929a98b82edf6fd7171777f06bf.svg?invert_in_darkmode" align="middle" width="19.48848pt" height="14.10255pt" style="position:relative;top:10px"/> and re-sampling it by <img alt="$Z_{-ik}$" src="https://rawgit.com/dadashkarimi/dadashkarimi.github.io/master/svgs/5e106c28ccbc3936410489fe9da8d97a.svg?invert_in_darkmode" align="middle" width="33.287595pt" height="22.38192pt" style="position:relative;top:10px"/> is effectively operating towards convergance to the real distributin.
We can think exactly analogously to topic modeling where each word is supposed to get a topic label through a large number of documents. 
Take a look at David Blei's dirichlete model for more details.

Hopefully you  picked up this article in less than 7 minutes!

```
@inproceedings{miller:2009,
  title={Nonparametric latent feature models for link prediction},
  author={Miller, Kurt and Jordan, Michael I and Griffiths, Thomas L},
  booktitle={Advances in neural information processing systems},
  pages={1276--1284},
  year={2009}
}
}
``` 

