---
date: 2026-03-18
title: How Linux Changed the Way I Think
desc: After enough years of using Linux, tinkering with it, breaking things and fixing them again, you start to carry a certain instinct with you. You begin to feel that most things on a computer are not fixed objects to be accepted as they are, but systems that can be questioned, inspected, and maybe bent a little.
showcase: true
tags:
  - Linux
  - Engineering
  - Systems
---

This is one of those things that sounds small when stated plainly, but stayed with me because of what it revealed. On the surface, this is a story about controlling my monitor through software on Linux. But that is only the example, not the point.

What really interests me is the kind of experience Linux gives over time. After enough years of using it, tinkering with it, breaking things and fixing them again, you start to carry a certain instinct with you. You begin to feel that most things on a computer are not fixed objects to be accepted as they are, but systems that can be questioned, inspected, and maybe bent a little.

That instinct matters more than any single tool. It changes not only what you know how to do, but what you think to try in the first place. This article is really about that, and the monitor is only the example that reminded me of it.

## What Other Systems Taught Me

Like everybody in the world I was introduced to computing through Windows. Due to my interests in computers, I became proficient in it but not at a Windows system admin level. Like every old school PC user, I’ve played games, cracked applications, and used Internet Download Manager. I learned that if something isn’t working, fix the .dll issue; it’s fixable but not magical. When I discovered Linux in my first year of bachelor’s, I switched immediately. I became attached to it. The freedom, the customization, the shell, and even Vim all added up to the kind of ecosystem I wanted. Using and tinkering with Linux taught me a special way of thinking, which I’ll discuss after my OS timeline.

After spending a long time with Linux, I needed a new device around the time Apple’s M1 machines were getting attention. They were impressive, had literal infinite battery life, great hardware, and were solid. So I bought one, and for many things, it was a great device.

Still, using macOS gave me a very different relationship with the machine. By that point, Linux had already taught me enough of the Unix side of things that using a shell on macOS did not feel new or revealing. What stood out to me instead were the inconsistencies, the keyboard shortcuts that felt arbitrary, and the general feeling that the system did not want me to change too much. It was polished, but also distant. MacOS did not make me feel incapable, but it did make me feel like the machine was no longer open to negotiation. It presented the device as a finished object rather than something I could interrogate. Because of that, even after three years on a Mac, my old computer, ancient as it was, still called back to me. On macOS, I often felt that I had lost the freedom to shape the machine around the way I actually wanted to use it.

I think the same is often true of Windows as well, even if I cannot say that with complete certainty. My impression is that these systems usually do not teach the user to think in that direction. They may allow certain things, but they do not cultivate the habit of asking whether deeper control is possible.

## The Actual Problem

Meanwhile, I had a small but surprisingly persistent problem: The brightness of my external monitor. Like any sensible software person, I eventually bought myself an external monitor, though it came with one annoying quirk. I use my computer both in the mornings and at night which of course gave me the need to change the brightness of my devices constantly. For the laptop it was fine, just push a key and voila it changed, but the only way to do for the external monitor was through the monitor’s physical controls.

That meant getting up, reaching for the little control dongle, pushing it in one direction, waiting for the brightness to move, then pushing again, and repeating that process until the screen was finally where I wanted it. Then I would do it all over again later in the day. Sometimes, at night, I would even reset the monitor back to a more neutral state just so I would not have to think about it as much the next morning. Even that brought a small but real amount of mental overhead.


<video width="300" controls>
  <source src="dongle.mp4" type="video/mp4">
</video>

The Dongle!!

It was not a dramatic problem, but it was exactly the kind of repetitive friction that slowly makes a setup feel worse than it should.

## What Linux Taught Me

Eventually, I bought a PC, installed Arch Linux immediately, and returned to the environment I had missed. The monitor problem was still there, but Linux had already taught me something important over the years: Easy or hard, but there is always a solution, if you are willing to investigate enough you can always find that solution.

That belief did not come from a single discovery, but from years of tinkering across Linux distributions, desktop environments, and window managers. [^1]

Over time, that kind of experience teaches patience, curiosity, and a deeper instinct: that almost everything in Linux can be inspected, configured, or scripted. After a while, possibility stops feeling exceptional and starts feeling expected.

That is the real point. Linux did not just give me a tool. It gave me the mindset to ask the question in the first place.

## Finding the Tool

Once I started thinking that way again, the solution was not far away. I searched a bit and found `ddcutil`. I did not even need to build something from scratch. The tool already did exactly what I needed: it let me control my external monitor directly through software.

That changed the whole experience immediately. Instead of standing up and working through physical controls every morning and every night, I could script brightness and RGB adjustments precisely the way I wanted. Some people might mention the `backlight` utility, but that is not really the same thing because it adjusts the system backlight rather than controlling an external monitor itself.

## Why It Matters

Now I have a setup that responds to me instead of forcing me into awkward little rituals throughout the day. I can change brightness and color settings without touching the monitor at all. The problem itself was small, but solving it reminded me of something much bigger.

Experience does more than help you solve problems. It shapes what kinds of solutions you are even capable of imagining. On macOS, and maybe on Windows too, I lived with the monitor as though its buttons were the only option. Linux, and years of tinkering with it, had taught me otherwise.

To be fair, this problem can probably be solved on macOS or Windows as well. The difference is not pure capability, but what each system teaches you to imagine. On Linux, it feels natural to ask where the system exposes the device[^2], how to talk to it, and whether it can be scripted. After enough time in that environment, exploration becomes instinct.

That is why this matters to me. The value of Linux is not only that it gives you control. It is that, after enough time with it, it teaches you to see control as something that might exist everywhere, even in places where most people would never think to look. It shapes your life as well. After enough time with Linux, that way of thinking does not stay confined to the computer. You begin to carry it into other parts of life too: the sense that things are not always as fixed as they first appear, that constraints can be questioned, and that with enough patience and effort, more is possible than you initially assumed.


[^1]: I used Mint, Ubuntu, Debian, Fedora, PopOS, Manjaro, Arch, NixOS, and even one distribution that marketed itself as very close to macOS, though I cannot remember its name now. On the desktop and window-manager side, I went through GNOME, KDE, LXQt, Deepin, Xfce, i3, bspwm, Qtile, Awesome, something written by Haskell, Suckless Stuff and eventually Hyprland.

[^2]: As a literal file under directory /dev.
