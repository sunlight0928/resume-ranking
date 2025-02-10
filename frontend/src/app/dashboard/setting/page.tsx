import dynamic from "next/dynamic";

import React from "react";
import HeadMain from "@/app/components/HeadMain"; // Import the HeadMain component
import BreadcrumbDashboard from "../components/layouts/BreadcrumbDashboard"; // Import the BreadcrumbDashboard component
// import TableJobs from "../components/table/TableJobs"; // Import the TableFAQ component
import { Button } from "../../components/ui/Button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/Avatar";
import { Label } from "../../components/ui/Label";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Checkbox } from "../../components/ui/Checkbox";

type Props = {};

const SettingPage = (props: Props) => {
  return (
    <>
      <HeadMain
        title="Setting Management • ResumeGenie"
        description="Setting Management • ResumeGenie"
      />
      <BreadcrumbDashboard title="My Settings" />
      <div className="bg-white rounded-xl shadow-sm dark:text-white dark:bg-gray-900">
        <div className="flex flex-col" id="job-management">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow">
                <div className="pl-4 pr-4 pt-4 pb-4 max-w-full">
                  <div className="space-y-8">
                    {/* Personal Info */}
                    <section>
                      <h2 className="mb-4 text-lg font-semibold text-[#171725] dark:text-white">
                        Personal Info
                      </h2>
                      <div className="mb-6 flex items-center">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src="/user_template.png" />
                          <AvatarFallback>RC</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <Button variant="link" className="text-[#7059f3] p-0">
                            Change Picture
                          </Button>
                          <p className="text-sm text-[#92929d]">
                            Allowed formats are : .jpg, .png
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Security Settings */}
                    <section>
                      <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
                        Security Settings
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">
                            Confirm Password
                          </Label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-[#92929d]">
                        Your password needs to be at least 8 characters long.
                        Includes some words and phrases to make it even safer
                      </p>
                    </section>

                    {/* Terms & Conditions */}
                    <section>
                      <h2 className="mb-4 text-lg font-semibold text-[#171725] dark:text-white">
                        Terms & Conditions
                      </h2>
                      <Card className="p-4 space-y-4 bg-white border border-[#e2e2ea] dark:bg-[#111827AA]">
                        <p className="text-[#171725] dark:text-white flex flex-row">
                          <svg
                            width="45"
                            height="45"
                            viewBox="0 0 30 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.32611 1.53551C7.90012 -0.0197935 10.0999 -0.0197937 10.6739 1.53551C11.0341 2.51158 12.1497 2.97365 13.0946 2.53819C14.6002 1.84431 16.1557 3.39978 15.4618 4.90543C15.0263 5.85033 15.4884 6.96588 16.4645 7.32611C18.0198 7.90012 18.0198 10.0999 16.4645 10.6739C15.4884 11.0341 15.0263 12.1497 15.4618 13.0946C16.1557 14.6002 14.6002 16.1557 13.0946 15.4618C12.1497 15.0263 11.0341 15.4884 10.6739 16.4645C10.0999 18.0198 7.90012 18.0198 7.32611 16.4645C6.96588 15.4884 5.85033 15.0263 4.90543 15.4618C3.39978 16.1557 1.84431 14.6002 2.53819 13.0946C2.97365 12.1497 2.51158 11.0341 1.53551 10.6739C-0.0197935 10.0999 -0.0197937 7.90012 1.53551 7.32611C2.51158 6.96588 2.97365 5.85033 2.53819 4.90543C1.84431 3.39978 3.39978 1.84431 4.90543 2.53819C5.85033 2.97365 6.96588 2.51158 7.32611 1.53551Z"
                              fill="#8571F5"
                            />
                          </svg>
                          Lorem ipsum dolor sit amet consectetur. Luctus libero
                          egestas sed ac praesent placerat malesuada. Magna
                          aliquam blandit accumsan quis ultrices orci. Dictum
                          posuere felis tellus a vitae amet ullamcorper donec
                          rhoncus. Vitae vestibulum dolor commodo cursus egestas
                          at senectus.
                        </p>
                        <p className="text-[#171725] dark:text-white flex flex-row">
                          <svg
                            width="45"
                            height="45"
                            viewBox="0 0 30 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.32611 1.53551C7.90012 -0.0197935 10.0999 -0.0197937 10.6739 1.53551C11.0341 2.51158 12.1497 2.97365 13.0946 2.53819C14.6002 1.84431 16.1557 3.39978 15.4618 4.90543C15.0263 5.85033 15.4884 6.96588 16.4645 7.32611C18.0198 7.90012 18.0198 10.0999 16.4645 10.6739C15.4884 11.0341 15.0263 12.1497 15.4618 13.0946C16.1557 14.6002 14.6002 16.1557 13.0946 15.4618C12.1497 15.0263 11.0341 15.4884 10.6739 16.4645C10.0999 18.0198 7.90012 18.0198 7.32611 16.4645C6.96588 15.4884 5.85033 15.0263 4.90543 15.4618C3.39978 16.1557 1.84431 14.6002 2.53819 13.0946C2.97365 12.1497 2.51158 11.0341 1.53551 10.6739C-0.0197935 10.0999 -0.0197937 7.90012 1.53551 7.32611C2.51158 6.96588 2.97365 5.85033 2.53819 4.90543C1.84431 3.39978 3.39978 1.84431 4.90543 2.53819C5.85033 2.97365 6.96588 2.51158 7.32611 1.53551Z"
                              fill="#8571F5"
                            />
                          </svg>
                          Lorem ipsum dolor sit amet consectetur. Luctus libero
                          egestas sed ac praesent placerat malesuada. Magna
                          aliquam blandit accumsan quis ultrices orci. Dictum
                          posuere felis tellus a vitae amet ullamcorper donec
                          rhoncus. Vitae vestibulum dolor commodo cursus egestas
                          at senectus.
                        </p>
                      </Card>
                      <div className="flex items-start gap-2 mt-4">
                        <Checkbox id="terms" />
                        <Label
                          htmlFor="terms"
                          className="text-sm text-[#7059f3]"
                        >
                          I agree to terms and conditions of resumegenie.com
                        </Label>
                      </div>
                    </section>

                    <div className="flex justify-end">
                      <Button className="bg-[#7059f3] hover:bg-[#7059f3]/90">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingPage;
