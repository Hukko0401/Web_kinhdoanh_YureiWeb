# YureiWeb — Gacha Collectibles E-commerce Platform

A full-stack gacha/collectibles e-commerce web application, built as a course project for "Phát triển web kinh doanh" (Business Web Development), covering the full product lifecycle from data model design to payment integration.

**Live demo:** [yurei-collectibles.netlify.app](https://yurei-collectibles.netlify.app)

## Overview

YureiWeb lets users purchase gacha boxes, collect items, manage their inventory, and exchange duplicate items with other users — with a full order, payment, and wallet system behind it.

## Key Features

- **Relational data model** (PostgreSQL/Supabase) with an ERD covering gacha mechanics, inventory, notifications, and user profiles
- **Row-Level Security (RLS)** enforced via SQL RPC functions, including `security definer` functions to safely bypass RLS for controlled operations (e.g., real-time username/phone duplicate validation during registration)
- **Atomic transactions** for item exchange, implemented as a Supabase RPC to guarantee consistency
- **Order & payment flow**: full create-order pipeline with shipping address management, Haversine-distance-based shipping fee tiers, and sandbox integration with **VNPAY** and **MoMo**
- **Wallet & transaction history**, built with a signal-based Angular architecture
- **Google OAuth** authentication via Supabase Auth
- **Inventory management** with a responsive UI

## Tech Stack

**Frontend:** Angular 18, SCSS
**Backend:** Supabase (PostgreSQL, Edge Functions, RPC, Row-Level Security, Auth)
**Deployment:** Netlify (frontend), ngrok (dev tunneling for payment sandbox callbacks)
**Payments:** VNPAY, MoMo (sandbox integration)

## Development

This project was generated using [Angular CLI](https://github.com/angular/angular-cli).

```bash
ng serve       # local dev server at http://localhost:4200
ng build       # production build
ng test        # unit tests (Vitest)
```
